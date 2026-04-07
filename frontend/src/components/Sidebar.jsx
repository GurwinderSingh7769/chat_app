import React, { useState } from "react";
import "./Sidebar.css";

export default function Sidebar({
  rooms, currentRoom, onRoomChange, onlineUsers, user, connected, logout, onAdminOpen
}) {
  const [search, setSearch] = useState("");

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const getOnlineCount = (roomId) =>
    onlineUsers.filter(u => u.room === roomId).length;

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sb-header">
        <div className="sb-header-left">
          <div className="sb-avatar-me">
            {user?.display_name?.[0]?.toUpperCase()}
          </div>
          <span className="sb-brand">Meridian</span>
        </div>
        <div className="sb-header-right">
          <span className={`sb-conn-dot ${connected ? "on" : "off"}`} title={connected ? "Connected" : "Reconnecting"} />
          {user?.role === "admin" && (
            <button className="sb-hdr-btn" onClick={onAdminOpen} title="Admin panel">
              ⚙️
            </button>
          )}
          <button className="sb-hdr-btn" onClick={logout} title="Sign out">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sb-search-wrap">
        <div className="sb-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="sb-search-icon">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            className="sb-search-input"
            placeholder="Search or start new chat"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="sb-list">
        {filtered.map(r => {
          const online = getOnlineCount(r.id);
          return (
            <div
              key={r.id}
              className={`sb-item ${currentRoom === r.id ? "active" : ""}`}
              onClick={() => onRoomChange(r.id)}
            >
              <div className="sb-item-avatar">
                {r.name.replace("# ", "")[0].toUpperCase()}
              </div>
              <div className="sb-item-body">
                <div className="sb-item-top">
                  <span className="sb-item-name">{r.name}</span>
                  {online > 0 && <span className="sb-item-badge">{online}</span>}
                </div>
                <span className="sb-item-sub">
                  {online > 0 ? `${online} online` : "No one online"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Online users section */}
      <div className="sb-online-section">
        <div className="sb-online-label">Online now · {onlineUsers.length}</div>
        <div className="sb-online-avatars">
          {onlineUsers.slice(0, 8).map(u => (
            <div key={u.username} className="sb-online-chip" title={u.display_name}>
              <div className="sb-online-av">{u.display_name?.[0]?.toUpperCase()}</div>
              <span className="sb-online-dot" />
            </div>
          ))}
          {onlineUsers.length > 8 && (
            <div className="sb-online-chip">
              <div className="sb-online-av more">+{onlineUsers.length - 8}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
