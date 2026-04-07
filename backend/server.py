from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from auth import auth_bp
from chat import chat_bp, register_socket_events

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(chat_bp, url_prefix="/api/chat")

register_socket_events(socketio)

if __name__ == "__main__":
    print("🚀 Chat server running on http://localhost:5000")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)
