import React, { useEffect, useRef } from "react";
import "./MessageList.css";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
}

export default function MessageList({ messages, currentUser }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="msg-list empty">
        <div className="msg-empty-box">
          <span className="msg-empty-icon">🔒</span>
          <p>Messages are end-to-end encrypted.</p>
          <p className="msg-empty-sub">Say hello!</p>
        </div>
      </div>
    );
  }

  // Insert date separators + group consecutive same-sender messages
  const items = [];
  let lastDateLabel = null;

  messages.forEach((msg, i) => {
    const label = formatDateLabel(msg.timestamp);
    if (label !== lastDateLabel) {
      items.push({ type: "date", label, key: `date-${i}` });
      lastDateLabel = label;
    }
    const prev = messages[i - 1];
    const sameAuthor = prev?.sender === msg.sender;
    const withinMinute = prev && new Date(msg.timestamp) - new Date(prev.timestamp) < 60000;
    items.push({ type: "msg", msg, grouped: sameAuthor && withinMinute });
  });

  return (
    <div className="msg-list">
      {items.map(item => {
        if (item.type === "date") {
          return (
            <div key={item.key} className="msg-date-sep">
              <span>{item.label}</span>
            </div>
          );
        }

        const { msg, grouped } = item;
        const isOwn = msg.sender === currentUser?.username;

        return (
          <div
            key={msg.id}
            className={`msg-row ${isOwn ? "own" : "other"} ${grouped ? "grouped" : ""}`}
          >
            <div className={`msg-bubble ${isOwn ? "out" : "in"}`}>
              {!isOwn && !grouped && (
                <div className="msg-sender-name">{msg.display_name}</div>
              )}
              <span className="msg-text">{msg.text}</span>
              <div className="msg-meta-row">
                <span className="msg-time">{formatTime(msg.timestamp)}</span>
                {isOwn && (
                  <span className="msg-ticks">✓✓</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
