import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPanel.css";

export default function AdminPanel({ onClose, onRoomsChange }) {
  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    axios.get("/api/chat/rooms").then(r => setRooms(r.data));
    axios.get("/api/chat/users").then(r => setUsers(r.data));
  };

  useEffect(() => { load(); }, []);

  const flash = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 2500);
  };

  const createRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      await axios.post("/api/chat/rooms", { name: newRoom.trim() });
      setNewRoom("");
      load();
      onRoomsChange();
      flash("Room created ✓");
    } catch (e) {
      flash(e.response?.data?.error || "Error", true);
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm(`Delete room "${id}"?`)) return;
    try {
      await axios.delete(`/api/chat/rooms/${id}`);
      load();
      onRoomsChange();
      flash("Room deleted");
    } catch (e) {
      flash(e.response?.data?.error || "Error", true);
    }
  };

  const deleteUser = async (username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await axios.delete(`/api/chat/users/${username}`);
      load();
      flash("User deleted");
    } catch (e) {
      flash(e.response?.data?.error || "Error", true);
    }
  };

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">
        <div className="admin-header">
          <button className="admin-back" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <span className="admin-title">Admin Panel</span>
        </div>

        <div className="admin-tabs">
          <button className={tab === "rooms" ? "active" : ""} onClick={() => setTab("rooms")}>
            Channels
          </button>
          <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
            Users
          </button>
        </div>

        {(error || success) && (
          <div className={`admin-flash ${error ? "err" : "ok"}`}>{error || success}</div>
        )}

        {tab === "rooms" && (
          <div className="admin-body">
            <div className="admin-create">
              <input
                placeholder="New channel name…"
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createRoom()}
              />
              <button onClick={createRoom}>Create</button>
            </div>

            {rooms.map(r => (
              <div key={r.id} className="admin-row">
                <div className="admin-row-avatar">{r.name.replace("# ", "")[0].toUpperCase()}</div>
                <div className="admin-row-info">
                  <span className="admin-row-name">{r.name}</span>
                  <span className="admin-row-sub">Created by {r.created_by}</span>
                </div>
                <button
                  className="admin-del-btn"
                  onClick={() => deleteRoom(r.id)}
                  disabled={["general", "random"].includes(r.id)}
                  title={["general", "random"].includes(r.id) ? "Default channel" : "Delete"}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="admin-body">
            {users.map(u => (
              <div key={u.username} className="admin-row">
                <div className={`admin-row-avatar ${u.role === "admin" ? "admin-av" : ""}`}>
                  {u.display_name?.[0]?.toUpperCase()}
                  <span className={`admin-status-dot ${u.online ? "on" : "off"}`} />
                </div>
                <div className="admin-row-info">
                  <span className="admin-row-name">{u.display_name}
                    {u.role === "admin" && <span className="admin-tag">admin</span>}
                  </span>
                  <span className="admin-row-sub">@{u.username} · {u.online ? "Online" : "Offline"}</span>
                </div>
                <button
                  className="admin-del-btn"
                  onClick={() => deleteUser(u.username)}
                  disabled={u.username === "admin"}
                  title={u.username === "admin" ? "Cannot delete admin" : "Delete user"}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
