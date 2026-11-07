# SchoolConnect – Student Social Interaction Platform

## Project Overview

Create a modern full-stack web application that allows students to register using their email addresses and interact with other students in a safe school environment.

The application should function similar to a simplified version of Facebook, Instagram, and LinkedIn, but designed specifically for schools.

## Core Features

### Student Authentication
- Register using Email ID
- Secure Login
- Password Reset
- Email Verification
- JWT Authentication

### Student Profiles
- Profile Photo
- Full Name
- Class and Section
- Bio
- Interests and Hobbies

### Social Feed
- Create text posts
- Upload images
- View posts from other students
- Like posts
- Comment on posts
- Hashtag support

### School Clubs
- Science Club
- Eco Club
- Coding Club
- Sports Club
- Arts Club

Each club should have:
- Dedicated page
- Discussions
- Events
- Members list

### Polls and Voting
- Create polls
- Vote once per student
- Display results graphically

### Notice Board
Teachers and Administrators can publish:
- Circulars
- Exam schedules
- Events
- Holiday notices

### Friend System
- Send connection requests
- Accept or reject requests
- Suggested friends

### Messaging
- One-to-one chat
- Online indicator
- Message history

## User Roles

### Student
- Manage profile
- Create posts
- Like and comment
- Join clubs
- Participate in polls
- Send friend requests

### Teacher
- Post announcements
- Moderate content
- Review reports

### Administrator
- Manage users
- Manage clubs
- Review statistics
- Block inappropriate users

## Recommended Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### ORM
- Prisma

### Authentication
- JWT
- Bcrypt Password Hashing
- Email Verification

### Storage
- Cloudinary

### Deployment
- Render

## Database Tables

- Users
- Profiles
- Posts
- Comments
- Likes
- FriendRequests
- Friends
- Clubs
- Polls
- Votes
- Messages
- Announcements

## UI Requirements

- Mobile Responsive
- Modern Design
- Dark Mode Support
- Accessibility Friendly
- Card Based Layout
- Smooth Animations

## Project Structure

```text
schoolconnect/
├── client/
├── server/
├── prisma/
├── docs/
└── README.md
```

## Deployment Requirements

Generate:
1. Complete Frontend Source Code
2. Complete Backend Source Code
3. PostgreSQL Schema
4. Prisma Models
5. Authentication APIs
6. Social Feed APIs
7. Club Management APIs
8. Deployment Instructions for Render

## Important Instruction for AI Studio

Generate a production-quality, responsive, full-stack social networking web application specifically designed for schools. Students must be able to register and log in using their email addresses and interact with other students through posts, comments, likes, clubs, polls, messaging, and announcements.

The application should be secure, well-structured, deployable on Render, and follow modern coding best practices.
