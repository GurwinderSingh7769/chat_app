# Meridian Chat App

A real-time chat application built with **Python (Flask + Socket.IO)** backend and **React** frontend.

---

## Project Structure

```
chat-app/
├── backend/
│   ├── server.py          # Flask app entry point
│   ├── auth.py            # Login / Register REST endpoints
│   ├── chat.py            # Room REST endpoints + all Socket.IO events
│   ├── store.py           # In-memory data store (users, rooms, messages)
│   ├── config.py          # App configuration
│   └── requirements.txt   # Python dependencies
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state + login/register/logout
    │   ├── hooks/
    │   │   └── useSocket.js       # Socket.IO connection hook
    │   ├── components/
    │   │   ├── Sidebar.jsx        # Rooms list + online users + footer
    │   │   ├── MessageList.jsx    # Grouped message bubbles
    │   │   ├── MessageInput.jsx   # Textarea + typing indicator
    │   │   └── AdminPanel.jsx     # Admin modal (manage rooms & users)
    │   ├── pages/
    │   │   ├── AuthPage.jsx       # Login + Register tabs
    │   │   └── ChatPage.jsx       # Main chat layout
    │   ├── App.jsx
    │   └── index.js
    └── package.json
```

---

## Prerequisites

| Tool    | Version     |
|---------|-------------|
| Python  | 3.9+        |
| Node.js | 16+         |
| npm     | 8+          |

---

## 🚀 Running the App

### 1 — Backend

```bash
cd chat-app/backend

# Create & activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
python server.py
```

Server runs at **http://localhost:5000**

---

### 2 — Frontend

Open a **second terminal**:

```bash
cd chat-app/frontend

npm install
npm start
```

App opens at **http://localhost:3000**

---

## 🔑 Demo Accounts

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | Admin |
| alice    | alice123  | User  |
| bob      | bob123    | User  |

You can also **register new accounts** from the login screen.

---

## Features

### User
- Register / login
- Join any channel from the sidebar
- Real-time messaging with Socket.IO
- Typing indicators ("Alice is typing…")
- Grouped consecutive messages (compact view)
- Online users list (live)
- Persistent message history per room (last 50 messages)

### Admin (login as `admin`)
- ⚙ button in the sidebar opens the Admin Panel
- **Rooms tab** — create & delete rooms
- **Users tab** — view all users, online status, roles, delete users

---

## Architecture Notes

- **In-memory store** (`store.py`): All data lives in Python dicts. Restart = data reset.  
  → For persistence replace with SQLite / PostgreSQL / MongoDB.
- **JWT auth**: Tokens expire in 24 h. Change `JWT_SECRET` in `config.py` for production.
- **Socket events**: `authenticate` → `join_room` → `send_message` / `typing` / `disconnect`

---

## Switching to a Real Database (optional)

1. Install `flask-sqlalchemy` or `pymongo`
2. Replace the dicts in `store.py` with DB models
3. Update `chat.py` and `auth.py` to use the ORM / collection methods

---

## Environment Variables (production)

```bash
export SECRET_KEY="your-flask-secret"
export JWT_SECRET="your-jwt-secret"
```
