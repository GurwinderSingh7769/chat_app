from flask import Blueprint, request, jsonify
import jwt
import datetime
import uuid
from store import USERS, ROOMS, MESSAGES
from config import Config

auth_bp = Blueprint("auth", __name__)


def generate_token(user: dict) -> str:
    payload = {
        "sub": user["id"],
        "username": next(k for k, v in USERS.items() if v["id"] == user["id"]),
        "role": user["role"],
        "display_name": user["display_name"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def decode_token(token: str):
    return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    user = USERS.get(username)
    if not user or user["password"] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user)
    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "username": username,
            "role": user["role"],
            "display_name": user["display_name"],
        },
    })


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("display_name") or username).strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if username in USERS:
        return jsonify({"error": "Username already taken"}), 409

    if len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400

    user_id = f"u_{uuid.uuid4().hex[:8]}"
    USERS[username] = {
        "id": user_id,
        "password": password,
        "role": "user",
        "display_name": display_name,
    }

    token = generate_token(USERS[username])
    return jsonify({
        "token": token,
        "user": {
            "id": user_id,
            "username": username,
            "role": "user",
            "display_name": display_name,
        },
    }), 201


@auth_bp.route("/me", methods=["GET"])
def me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        payload = decode_token(token)
        return jsonify(payload)
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
