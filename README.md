# SchoolConnect – Student Social Interaction Platform

SchoolConnect is a modern, responsive full-stack social networking web application designed specifically for schools. It combines the community aspects of Instagram, Facebook, and LinkedIn within a secure, moderated educational environment.

Students can connect with classmates, join school clubs, vote in campus polls, exchange real-time messages, and view official school circulars and exam schedules.

---

## 🌟 Key Features

### 🎓 1. Student Authentication & Profiles
- Register using school email with class & section.
- Secure login, JWT authentication, Bcrypt password hashing.
- Email verification & password reset flows.
- Comprehensive student profile: avatar, bio, class & section, interests & hobbies tag cloud.

### 📰 2. Social Feed
- Create rich text posts with photos and image URLs.
- Like posts with optimistic real-time UI counters.
- Nested comments section with replies.
- Hashtags support (`#CodingClub`, `#ScienceFair`, `#EcoCampus`, `#SportsDay`).
- Filter feed by popular school hashtags.

### 🏛️ 3. School Clubs
Dedicated club room with discussions, upcoming events, and members list:
- 🔬 **Science Club**
- 🌱 **Eco Club**
- 💻 **Coding Club**
- ⚽ **Sports Club**
- 🎨 **Arts Club**
- One-click Join / Leave club membership.

### 📊 4. School Polls & Voting
- Transparent student polls on school events and themes.
- Strictly enforced **Vote once per student** rule.
- Graphical progress bars and real-time percentage breakdown.

### 📢 5. Notice Board
- Published exclusively by Teachers and Administrators.
- Categories: Circulars, Exam Schedules, Events, and Holiday Notices.
- Priority alert badges (`URGENT`, `IMPORTANT`, `NORMAL`).

### 🤝 6. Friend & Connection System
- Send and accept/reject connection requests.
- Suggested classmates based on school grade and shared interests.
- View classmate profiles and mutual clubs.

### 💬 7. Real-Time One-to-One Messaging
- Direct student chat powered by Socket.IO.
- Real-time online presence indicator.
- Instant message delivery with typing indicators and unread counters.

### 🛡️ 8. Role-Based Access & Safety Administration
- **Students**: Full social, club, and polling engagement.
- **Teachers**: Notice publishing, academic mentoring, content moderation.
- **Administrators**: Platform analytics, user suspension / blocking, club management, report triage.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Router v6, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.IO, Multer |
| **Database** | PostgreSQL (Production/Render) & SQLite (Local zero-config dev) |
| **ORM** | Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt Password Hashing |
| **Deployment** | Render (`render.yaml` Blueprint & Manual guides) |

---

## 📁 Project Structure

```text
schoolconnect/
├── client/                     # Frontend React + TypeScript application
│   ├── src/
│   │   ├── components/         # Common, layout, feed, clubs, polls, notices, chat, admin
│   │   ├── context/            # AuthContext, ThemeContext, SocketContext
│   │   ├── pages/              # Home, Login, Register, Profile, Clubs, Polls, Notices, Chat, Admin
│   │   ├── services/           # REST API client services
│   │   └── types/              # Full TypeScript models and contracts
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Backend Node.js / Express API
│   ├── src/
│   │   ├── controllers/        # Auth, Post, Club, Poll, Notice, Friend, Message, Admin
│   │   ├── routes/             # Express v1 route definitions
│   │   ├── middleware/         # JWT Auth, Role checking, Error handling, Multer uploads
│   │   ├── services/           # Socket.io real-time chat, email simulation
│   │   ├── app.ts              # Express application setup & middleware
│   │   └── server.ts           # HTTP server + Socket.io listener
│   ├── tsconfig.json
│   └── package.json
├── prisma/
│   ├── schema.prisma           # Production PostgreSQL Schema
│   ├── schema.sqlite.prisma    # Local SQLite Schema for instant offline testing
│   └── seed.ts                 # Full seed data (clubs, students, teachers, admin, posts, polls)
├── docs/
│   ├── API_DOCUMENTATION.md    # Complete REST API reference
│   ├── DATABASE_SCHEMA.md      # PostgreSQL tables & Mermaid ER diagram
│   └── DEPLOYMENT_GUIDE.md     # Step-by-step Render deployment walkthrough
├── render.yaml                 # Infrastructure-as-code Render Blueprint
├── package.json                # Root workspace orchestration script
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
Run the workspace installer from the root directory:
```bash
npm run install:all
```

### 2. Setup Database & Seed Initial Data
You can use PostgreSQL or SQLite for instant local zero-config testing:

#### Option A: Quick Local SQLite (Zero database install required)
```bash
cd server
npm run db:push:sqlite
npm run db:seed:sqlite
```

#### Option B: PostgreSQL (Production default)
Set your `DATABASE_URL` in `server/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/schoolconnect?schema=public"
```
Then run:
```bash
npm run db:push
npm run db:seed
```

### 3. Start Both Backend & Frontend
From the root directory:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Pre-Seeded Demo Accounts

The database seed provides ready-to-test accounts with preloaded posts, clubs, and friendships. You can also log in with 1-click directly from the **Sign In** screen:

| Role | Name | Email | Password |
|---|---|---|---|
| 🎓 **Student** | Alex Rivera (10th-A) | `alex@schoolconnect.edu` | `Password123!` |
| 🎓 **Student** | Emma Watson (10th-A) | `emma@schoolconnect.edu` | `Password123!` |
| 🎓 **Student** | Liam Chen (11th-B) | `liam@schoolconnect.edu` | `Password123!` |
| 🎓 **Student** | Sophia Patel (9th-C) | `sophia@schoolconnect.edu` | `Password123!` |
| 👨‍🏫 **Teacher** | Mrs. Sarah Johnson | `teacher@schoolconnect.edu` | `Password123!` |
| ★ **Principal/Admin** | Arthur Edwards | `admin@schoolconnect.edu` | `Password123!` |

---

## 🌐 Deployment to Render

SchoolConnect is fully configured for zero-friction deployment on Render via the included `render.yaml` blueprint.

For complete instructions, refer to:
👉 **[Render Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**

---

## 📚 API & Database Documentation

- **[REST API Documentation](docs/API_DOCUMENTATION.md)**
- **[PostgreSQL Database Schema & ERD](docs/DATABASE_SCHEMA.md)**

---

## 🛡️ Student Safety & Code of Conduct
SchoolConnect enforces a safe educational environment:
- Profanity and harassment are prohibited.
- Students can report inappropriate posts to school moderators.
- Teachers and Administrators have direct tools to moderate posts and suspend accounts.
