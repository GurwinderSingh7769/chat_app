import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import "./MessageInput.css";

export default function MessageInput({ onSend, onTyping, typingUsers, disabled }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!isTyping.current) {
      isTyping.current = true;
      onTyping(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      onTyping(false);
    }, 1500);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    clearTimeout(typingTimer.current);
    isTyping.current = false;
    onTyping(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const onEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newText = text.slice(0, start) + emoji + text.slice(end);
      setText(newText);
      // Re-focus and place cursor after emoji
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setText(prev => prev + emoji);
    }
  };

  const typingText =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing…`
      : typingUsers.length > 1
      ? `${typingUsers.slice(0, 2).join(" & ")} are typing…`
      : "";

  return (
    <div className="input-area">
      {typingText && (
        <div className="typing-bar">
          <span className="typing-dots">
            <span /><span /><span />
          </span>
          {typingText}
        </div>
      )}

      <div className="input-row">
        {/* Emoji button */}
        <div className="emoji-wrap" ref={emojiRef}>
          <button
            className={`input-icon-btn emoji-btn ${showEmoji ? "active" : ""}`}
            onClick={() => setShowEmoji(v => !v)}
            title="Emoji"
            type="button"
            disabled={disabled}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </button>

          {showEmoji && (
            <div className="emoji-picker-wrap">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme="dark"
                searchPlaceHolder="Search emoji..."
                width={320}
                height={400}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
              />
            </div>
          )}
        </div>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          className="msg-input"
          rows={1}
          placeholder={disabled ? "Connecting…" : "Type a message"}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKey}
          disabled={disabled}
        />

        {/* Send / Mic button */}
        {text.trim() ? (
          <button className="send-btn" onClick={submit} disabled={disabled} type="button">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        ) : (
          <button className="send-btn mic" disabled={disabled} type="button" title="Voice message (coming soon)">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
