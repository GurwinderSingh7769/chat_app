from flask import Blueprint, request, jsonify
from flask_socketio import emit, join_room, leave_room
import uuid
import datetime
import jwt
from store import USERS, ROOMS, MESSAGES, ONLINE_USERS
from config import Config

chat_bp = Blueprint("chat", __name__)


# ── REST helpers ──────────────────────────────────────────────────────────────

def get_user_from_token(req):
    token = req.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None
    try:
        return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None


@chat_bp.route("/rooms", methods=["GET"])
def list_rooms():
    return jsonify(list(ROOMS.values()))


@chat_bp.route("/rooms", methods=["POST"])
def create_room():
    user = get_user_from_token(request)
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    data = request.get_json()
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Room name required"}), 400

    room_id = name.lower().replace(" ", "-")
    if room_id in ROOMS:
        return jsonify({"error": "Room already exists"}), 409

    ROOMS[room_id] = {
        "id": room_id,
        "name": f"# {name}",
        "created_by": user["username"],
        "created_at": datetime.datetime.utcnow().isoformat(),
        "members": [],
    }
    MESSAGES[room_id] = []
    return jsonify(ROOMS[room_id]), 201


@chat_bp.route("/rooms/<room_id>", methods=["DELETE"])
def delete_room(room_id):
    user = get_user_from_token(request)
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    if room_id not in ROOMS:
        return jsonify({"error": "Room not found"}), 404

    del ROOMS[room_id]
    MESSAGES.pop(room_id, None)
    return jsonify({"ok": True})


@chat_bp.route("/rooms/<room_id>/messages", methods=["GET"])
def get_messages(room_id):
    user = get_user_from_token(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    msgs = MESSAGES.get(room_id, [])
    return jsonify(msgs[-100:])  # last 100


@chat_bp.route("/users", methods=["GET"])
def list_users():
    user = get_user_from_token(request)
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    result = []
    for username, u in USERS.items():
        result.append({
            "id": u["id"],
            "username": username,
            "role": u["role"],
            "display_name": u["display_name"],
            "online": any(
                v["username"] == username for v in ONLINE_USERS.values()
            ),
        })
    return jsonify(result)


@chat_bp.route("/users/<username>", methods=["DELETE"])
def delete_user(username):
    user = get_user_from_token(request)
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403
    if username == "admin":
        return jsonify({"error": "Cannot delete admin"}), 400
    if username not in USERS:
        return jsonify({"error": "User not found"}), 404
    del USERS[username]
    return jsonify({"ok": True})


# ── Socket events ─────────────────────────────────────────────────────────────

def register_socket_events(socketio):

    def auth_socket(token):
        try:
            return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        except Exception:
            return None

    @socketio.on("connect")
    def on_connect():
        pass

    @socketio.on("authenticate")
    def on_auth(data):
        from flask import request as req
        token = data.get("token", "")
        user = auth_socket(token)
        if not user:
            emit("auth_error", {"message": "Invalid token"})
            return
        sid = req.sid
        ONLINE_USERS[sid] = {"username": user["username"], "room": None, "display_name": user["display_name"]}
        emit("authenticated", {"username": user["username"], "role": user["role"]})
        socketio.emit("online_users", _online_list())

    @socketio.on("join_room")
    def on_join(data):
        from flask import request as req
        sid = req.sid
        room_id = data.get("room")
        if room_id not in ROOMS:
            emit("error", {"message": "Room not found"})
            return

        info = ONLINE_USERS.get(sid)
        if not info:
            return

        # Leave previous room
        old_room = info.get("room")
        if old_room:
            leave_room(old_room)
            emit("user_left", {"username": info["username"], "room": old_room}, to=old_room)

        join_room(room_id)
        ONLINE_USERS[sid]["room"] = room_id

        # Send history
        history = MESSAGES.get(room_id, [])[-50:]
        emit("room_history", {"room": room_id, "messages": history})
        emit("user_joined", {"username": info["username"], "room": room_id}, to=room_id)
        socketio.emit("online_users", _online_list())

    @socketio.on("send_message")
    def on_message(data):
        from flask import request as req
        sid = req.sid
        info = ONLINE_USERS.get(sid)
        if not info or not info.get("room"):
            return

        room_id = info["room"]
        text = (data.get("text") or "").strip()
        if not text:
            return

        msg = {
            "id": uuid.uuid4().hex,
            "sender": info["username"],
            "display_name": info["display_name"],
            "text": text,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "room": room_id,
        }
        MESSAGES.setdefault(room_id, []).append(msg)
        socketio.emit("new_message", msg, to=room_id)

    @socketio.on("typing")
    def on_typing(data):
        from flask import request as req
        sid = req.sid
        info = ONLINE_USERS.get(sid)
        if not info or not info.get("room"):
            return
        emit("user_typing", {
            "username": info["username"],
            "typing": data.get("typing", False),
        }, to=info["room"], include_self=False)

    @socketio.on("disconnect")
    def on_disconnect():
        from flask import request as req
        sid = req.sid
        info = ONLINE_USERS.pop(sid, None)
        if info and info.get("room"):
            emit("user_left", {"username": info["username"], "room": info["room"]}, to=info["room"])
        socketio.emit("online_users", _online_list())


def _online_list():
    seen = set()
    result = []
    for v in ONLINE_USERS.values():
        if v["username"] not in seen:
            seen.add(v["username"])
            result.append({"username": v["username"], "display_name": v["display_name"], "room": v.get("room")})
    return result
