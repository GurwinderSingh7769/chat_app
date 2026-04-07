"""
In-memory store for users, messages, and rooms.
Replace with a real DB (PostgreSQL / MongoDB) for production.
"""

from datetime import datetime

# Pre-seeded users  {username: {password, role, id}}
USERS = {
    "admin": {
        "id": "u_admin",
        "password": "admin123",
        "role": "admin",
        "display_name": "Admin",
    },
    "alice": {
        "id": "u_alice",
        "password": "alice123",
        "role": "user",
        "display_name": "Alice",
    },
    "bob": {
        "id": "u_bob",
        "password": "bob123",
        "role": "user",
        "display_name": "Bob",
    },
}

# rooms: {room_id: {name, created_by, created_at, members: []}}
ROOMS = {
    "general": {
        "id": "general",
        "name": "# general",
        "created_by": "admin",
        "created_at": datetime.utcnow().isoformat(),
        "members": [],
    },
    "random": {
        "id": "random",
        "name": "# random",
        "created_by": "admin",
        "created_at": datetime.utcnow().isoformat(),
        "members": [],
    },
}

# messages: {room_id: [ {id, sender, text, timestamp} ]}
MESSAGES: dict = {"general": [], "random": []}

# online users: {sid: {username, room}}
ONLINE_USERS: dict = {}
