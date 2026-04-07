import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import AdminPanel from "../components/AdminPanel";
import "./Chat.css";

export default function ChatPage() {
  const { user, token, logout } = useAuth();
  const { socket, connected, onlineUsers } = useSocket(token);

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    axios.get("/api/chat/rooms").then(r => {
      setRooms(r.data);
      if (r.data.length) setCurrentRoom(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onHistory = ({ room, messages: msgs }) => {
      if (room === currentRoom) setMessages(msgs);
    };
    const onNew = (msg) => {
      if (msg.room === currentRoom) setMessages(prev => [...prev, msg]);
    };
    const onTyping = ({ username, typing }) => {
      if (username === user.username) return;
      setTypingUsers(prev =>
        typing ? [...new Set([...prev, username])] : prev.filter(u => u !== username)
      );
    };

    socket.on("room_history", onHistory);
    socket.on("new_message", onNew);
    socket.on("user_typing", onTyping);

    return () => {
      socket.off("room_history", onHistory);
      socket.off("new_message", onNew);
      socket.off("user_typing", onTyping);
    };
  }, [socket, currentRoom, user]);

  useEffect(() => {
    if (socket && currentRoom) {
      setMessages([]);
      socket.emit("join_room", { room: currentRoom });
    }
  }, [socket, currentRoom]);

  const sendMessage = (text) => {
    if (socket && text.trim()) socket.emit("send_message", { text });
  };

  const sendTyping = (typing) => {
    if (socket) socket.emit("typing", { typing });
  };

  const refreshRooms = () => {
    axios.get("/api/chat/rooms").then(r => setRooms(r.data));
  };

  const currentRoomData = rooms.find(r => r.id === currentRoom);
  const roomOnlineCount = onlineUsers.filter(u => u.room === currentRoom).length;

  return (
    <div className="chat-root">
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomChange={setCurrentRoom}
        onlineUsers={onlineUsers}
        user={user}
        connected={connected}
        logout={logout}
        onAdminOpen={() => setShowAdmin(true)}
      />

      <div className="chat-main">
        {/* Chat header */}
        {currentRoomData && (
          <div className="chat-header">
            <div className="chat-header-avatar">
              {currentRoomData.name.replace("# ", "")[0].toUpperCase()}
            </div>
            <div className="chat-header-info">
              <span className="chat-header-name">{currentRoomData.name}</span>
              <span className="chat-header-sub">
                {roomOnlineCount > 0
                  ? `${roomOnlineCount} online`
                  : "No one online"}
              </span>
            </div>
            <div className="chat-header-actions">
              <button className="chat-hdr-btn" title="Search (coming soon)">
                <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <MessageList messages={messages} currentUser={user} />

        <MessageInput
          onSend={sendMessage}
          onTyping={sendTyping}
          typingUsers={typingUsers}
          disabled={!connected || !currentRoom}
        />
      </div>

      {showAdmin && user?.role === "admin" && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onRoomsChange={refreshRooms}
        />
      )}
    </div>
  );
}
