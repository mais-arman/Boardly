# Boardly

<div align="center">

Production-grade Kanban collaboration platform built for modern teams, realtime workflows, and scalable project management.

Designed with a full-stack architecture using React, TypeScript, Flask, PostgreSQL, Redis, Socket.IO, and Docker.

</div>

---

# ✨ Overview

Boardly is a modern task management and collaboration system inspired by professional Kanban platforms like Trello and Jira.

The system enables teams to manage projects using boards, lists, and cards while supporting realtime collaboration, role-based permissions, invitations, labels, comments, assignees, and admin-level management.

The project was designed with scalability, clean architecture, and production-ready practices in mind.

---

# 🚀 Core Features

## 🔐 Authentication & Authorization
- JWT Authentication
- Access & Refresh Tokens
- Email Verification
- Protected Routes
- Role-Based Access Control (RBAC)
- Secure Middleware Validation

## 📋 Board Management
- Create and manage multiple boards
- Board customization
- Board ownership system
- Board member invitations
- Board role management

## 👥 Roles & Permissions
Supported board roles:
- Owner
- Admin
- Editor
- Viewer

Permission-based actions:
- Manage members
- Edit cards/lists
- Read-only access
- Delete permissions

## 📌 Lists & Cards
- Drag & Drop Kanban workflow
- Dynamic list ordering
- Card movement between lists
- Card details modal
- Due dates
- Card editing
- Card deletion

## 🏷 Labels & Assignees
- Create custom labels
- Apply labels to cards
- Assign members to tasks
- Task categorization system

## 💬 Comments & Activity
- Realtime comments
- Card discussion workflow
- User-linked comment system

## ⚡ Realtime Collaboration
Implemented using Socket.IO:
- Live board synchronization
- Instant card updates
- Realtime invitations
- Realtime comments
- Live board activity refresh

## 🛡 Admin Dashboard
- Manage all users
- Manage all boards
- Delete boards
- Update user roles
- System-level moderation

---

# 🏗 System Architecture

## Frontend Stack
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Socket.IO Client

## Backend Stack
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- Flask-SocketIO
- Redis
- PostgreSQL

## Infrastructure
- Docker
- Docker Compose

---

# 📂 Project Structure

```txt
BOARDLY/
│
├── apps/
│   ├── backend/
│   └── frontend/
│
├── docs/
│   └── Boardly_Backend_Postman.md
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# ⚙ Frontend Architecture

The frontend follows a scalable feature-based architecture.

```txt
src/
│
├── app/
│   ├── constants/
│   └── router/
│
├── features/
│   ├── admin/
│   ├── auth/
│   ├── boards/
│   └── dashboard/
│
├── shared/
│   ├── api/
│   ├── components/
│   ├── realtime/
│   └── styles/
```

---

# 🐳 Running The Project

## Run with Docker

```bash
docker-compose up --build
```

Frontend:
```txt
http://localhost:5173
```

Backend API:
```txt
http://localhost:8001
```

---

# 🔧 Environment Variables

## Frontend

```env
VITE_API_BASE_URL=http://localhost:8001/api
VITE_SOCKET_URL=http://localhost:8001
```

## Backend

```env
DATABASE_URL=
JWT_SECRET_KEY=
REDIS_URL=
MAIL_USERNAME=
MAIL_PASSWORD=
```

---

# 👩‍💻 Developer

### Mais Arman

Full-stack developer focused on building scalable, realtime, and production-ready web applications using modern frontend and backend technologies.
