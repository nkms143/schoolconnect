# SchoolConnect REST API Documentation

Base URL: `/api/v1`
Authentication: Bearer Token in `Authorization` header (`Bearer <JWT_TOKEN>`)

---

## 1. Authentication APIs (`/api/v1/auth`)

### 1.1 Register User
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student@schoolconnect.edu",
  "password": "Password123!",
  "fullName": "Jordan Smith",
  "grade": "10th",
  "section": "Section A",
  "role": "STUDENT"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful! Welcome to SchoolConnect.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "cuid...",
      "email": "student@schoolconnect.edu",
      "role": "STUDENT",
      "isVerified": true,
      "profile": {
        "fullName": "Jordan Smith",
        "grade": "10th",
        "section": "Section A",
        "avatarUrl": "..."
      }
    }
  }
}
```

### 1.2 Login User
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "alex@schoolconnect.edu",
  "password": "Password123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { ... }
  }
}
```

### 1.3 Get Current User (`Me`)
- **Method**: `GET`
- **Endpoint**: `/api/v1/auth/me`
- **Access**: Private (Bearer Token)
- **Success Response (200 OK)**: Returns currently logged in user profile, role, and joined clubs.

### 1.4 Forgot Password
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/forgot-password`
- **Request Body**: `{ "email": "alex@schoolconnect.edu" }`
- **Response**: Dispatches password reset token via simulated email service.

### 1.5 Reset Password
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/reset-password`
- **Request Body**: `{ "token": "string", "newPassword": "newPassword123!" }`

### 1.6 Verify Email
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/verify-email`
- **Request Body**: `{ "token": "string", "email": "student@schoolconnect.edu" }`

---

## 2. Social Feed APIs (`/api/v1/posts`)

### 2.1 Get Social Feed
- **Method**: `GET`
- **Endpoint**: `/api/v1/posts/feed?clubId=&hashtag=&authorId=&page=1&limit=15`
- **Access**: Private
- **Response**: Array of posts with author profile, club name, like count, comment count, and `isLiked` status.

### 2.2 Create Post
- **Method**: `POST`
- **Endpoint**: `/api/v1/posts`
- **Access**: Private
- **Request Body**:
```json
{
  "content": "Just won the regional chess tournament! ♟️🏆",
  "imageUrl": "https://images.unsplash.com/...",
  "clubId": "club_cuid",
  "hashtags": "#Chess,#Competition"
}
```

### 2.3 Like / Unlike Post (Toggle)
- **Method**: `POST`
- **Endpoint**: `/api/v1/posts/:postId/like`
- **Access**: Private
- **Response**: `{ "isLiked": true, "likesCount": 12 }`

### 2.4 Add Comment
- **Method**: `POST`
- **Endpoint**: `/api/v1/posts/:postId/comments`
- **Request Body**: `{ "content": "Congratulations on the win!" }`

### 2.5 Delete Post
- **Method**: `DELETE`
- **Endpoint**: `/api/v1/posts/:postId`
- **Access**: Author, Teacher, or Admin only

### 2.6 Direct Media Upload
- **Method**: `POST`
- **Endpoint**: `/api/v1/posts/upload`
- **Format**: `multipart/form-data` (`image` file field)
- **Response**: `{ "url": "/uploads/image-1700000.png" }`

---

## 3. School Clubs APIs (`/api/v1/clubs`)

### 3.1 Get All Clubs
- **Method**: `GET`
- **Endpoint**: `/api/v1/clubs`
- **Response**: List of all clubs (Science Club, Eco Club, Coding Club, Sports Club, Arts Club) with member and event stats.

### 3.2 Get Club Details by Slug
- **Method**: `GET`
- **Endpoint**: `/api/v1/clubs/:slug`
- **Response**: Club details, leader info, recent discussions, upcoming events, and members list.

### 3.3 Join Club
- **Method**: `POST`
- **Endpoint**: `/api/v1/clubs/:clubId/join`
- **Access**: Private

### 3.4 Leave Club
- **Method**: `POST`
- **Endpoint**: `/api/v1/clubs/:clubId/leave`
- **Access**: Private

### 3.5 Create Club Discussion
- **Method**: `POST`
- **Endpoint**: `/api/v1/clubs/:clubId/discussions`
- **Request Body**: `{ "title": "Topic", "content": "Discussion text" }`

### 3.6 Schedule Club Event
- **Method**: `POST`
- **Endpoint**: `/api/v1/clubs/:clubId/events`
- **Request Body**:
```json
{
  "title": "Weekend Hackathon",
  "description": "Collaborative coding sprint",
  "eventDate": "2026-11-20T10:00:00Z",
  "location": "Computer Lab 3"
}
```

---

## 4. Polls & Voting APIs (`/api/v1/polls`)

### 4.1 Get Polls
- **Method**: `GET`
- **Endpoint**: `/api/v1/polls`
- **Response**: All polls with percentage calculations, total votes, and `hasVoted` state.

### 4.2 Create Poll
- **Method**: `POST`
- **Endpoint**: `/api/v1/polls`
- **Request Body**:
```json
{
  "question": "Which theme for annual cultural festival?",
  "options": ["Retro Cyberpunk", "Botanical Garden", "Beyond the Stars"],
  "expiresDays": 7
}
```

### 4.3 Vote on Poll
- **Method**: `POST`
- **Endpoint**: `/api/v1/polls/:pollId/vote`
- **Request Body**: `{ "optionId": "option_cuid" }`
- **Note**: Strictly enforced **vote once per student** rule. Repeated votes return status 400.

---

## 5. Notice Board APIs (`/api/v1/announcements`)

### 5.1 Get Announcements
- **Method**: `GET`
- **Endpoint**: `/api/v1/announcements?category=CIRCULAR&priority=URGENT`
- **Categories**: `CIRCULAR`, `EXAM_SCHEDULE`, `EVENT`, `HOLIDAY_NOTICE`

### 5.2 Publish Notice
- **Method**: `POST`
- **Endpoint**: `/api/v1/announcements`
- **Access**: Teachers & Administrators only
- **Request Body**:
```json
{
  "title": "Exam Schedule Circular",
  "content": "Official dates for grades 9-12...",
  "category": "EXAM_SCHEDULE",
  "priority": "URGENT",
  "targetGrade": "ALL"
}
```

### 5.3 Delete Notice
- **Method**: `DELETE`
- **Endpoint**: `/api/v1/announcements/:id`
- **Access**: Teachers & Administrators only

---

## 6. Friend & Connection System APIs (`/api/v1/friends`)

- `GET /api/v1/friends`: List of accepted classmates connections.
- `GET /api/v1/friends/pending`: Sent & received connection requests.
- `POST /api/v1/friends/request`: Send connection request (`{ "receiverId": "..." }`).
- `PUT /api/v1/friends/request/:requestId/accept`: Accept connection.
- `PUT /api/v1/friends/request/:requestId/reject`: Reject connection.
- `DELETE /api/v1/friends/:friendshipId`: Disconnect connection.
- `GET /api/v1/users/suggestions`: Suggested classmates in same school.

---

## 7. Messaging APIs (`/api/v1/messages`)

- `GET /api/v1/messages/conversations`: List active chats with last message and unread count.
- `GET /api/v1/messages/user/:targetUserId`: Full chat history with student.
- `POST /api/v1/messages`: Send one-to-one message (`{ "receiverId": "...", "content": "..." }`).

---

## 8. Administration & Moderation APIs (`/api/v1/admin`)

- `GET /api/v1/admin/stats`: Total platform metrics (students, teachers, posts, clubs, polls).
- `GET /api/v1/admin/users`: Search and paginate all registered users.
- `PUT /api/v1/admin/users/:userId/toggle-block`: Block / unblock inappropriate student account.
- `POST /api/v1/admin/clubs`: Create a new official school club.
- `GET /api/v1/admin/reports`: Review student reports and flagged content.
- `POST /api/v1/admin/reports`: Submit an inappropriate content report (student safety).
