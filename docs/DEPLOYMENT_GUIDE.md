# SchoolConnect – Deployment Instructions for Render

This guide provides step-by-step instructions to deploy SchoolConnect to **[Render](https://render.com/)** with PostgreSQL, Express Backend, and React Frontend.

---

## Method 1: One-Click Blueprint Deployment (Recommended)

Render Blueprints allow you to provision the PostgreSQL database, backend service, and frontend static site automatically from `render.yaml`.

### Step 1: Push Code to GitHub / GitLab
Make sure your repository has `render.yaml` at the root.

### Step 2: Create Blueprint on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your Git repository (`SchoolConnect`).
4. Render will detect the `render.yaml` blueprint:
   - **Backend Web Service**: `schoolconnect-backend` (Node.js runtime)
   - **Frontend Web Service**: `schoolconnect` (Static React build)
5. Under Environment Variables for `schoolconnect-backend`, paste your Supabase `DATABASE_URL` (Connection Pooler URL).
6. Click **Apply Blueprint**. Render will build both projects, execute Prisma schema push to Supabase, seed the demo data, and go live!

---

## Method 2: Manual Service-by-Service Deployment on Render

If you prefer deploying services manually through the Render dashboard:

### 1. Provision Managed PostgreSQL Database
1. Go to **New +** > **PostgreSQL**.
2. Set Name: `schoolconnect-db`.
3. Set Database: `schoolconnect`.
4. Set User: `schoolconnect_user`.
5. Select the **Free** tier.
6. Click **Create Database**.
7. Copy the **Internal Database URL** (e.g. `postgresql://...`).

---

### 2. Deploy Backend Web Service
1. Go to **New +** > **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `schoolconnect-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run db:generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run db:push && npm run db:seed && npm start
     ```
   - **Plan**: `Free`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: *(Paste Render PostgreSQL internal URL)*
   - `JWT_SECRET`: *(Generate a secure 32+ character random secret)*
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://schoolconnect.onrender.com` *(Update after creating frontend)*
5. Click **Create Web Service**. Wait for the build and seed logs to finish with `🚀 SchoolConnect Server running on port 10000`.

---

### 3. Deploy Frontend Static Site
1. Go to **New +** > **Static Site**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `schoolconnect`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add the following **Environment Variables**:
   - `VITE_API_URL`: `https://schoolconnect-backend.onrender.com`
   - `VITE_SOCKET_URL`: `https://schoolconnect-backend.onrender.com`
5. Configure Redirects / Rewrites in Render Settings:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite` (ensures React Router SPA handles all sub-paths)
6. Click **Create Static Site**.

---

## 4. Verification & Testing

Once deployed, visit your frontend URL (e.g., `https://schoolconnect.onrender.com`):
1. **Student Login**: Click the demo button for `alex@schoolconnect.edu` (Password: `Password123!`).
2. **Teacher Login**: Click `teacher@schoolconnect.edu` to test publishing official school circulars.
3. **Admin Login**: Click `admin@schoolconnect.edu` to inspect student moderation and platform statistics.

---

## 5. Environment Variables Reference

| Variable | Service | Description |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Secret key used to sign and verify JWT auth tokens |
| `JWT_EXPIRES_IN` | Backend | Token validity period (e.g. `7d`) |
| `CLIENT_URL` | Backend | URL of the frontend for CORS authorization |
| `VITE_API_URL` | Frontend | URL of backend API for fetch requests |
| `VITE_SOCKET_URL` | Frontend | URL for Socket.IO real-time websocket connection |
