import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", display_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.password, form.display_name || form.username);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-root">
      <div className="auth-brand">
        <div className="auth-brand-icon">💬</div>
        <span className="auth-brand-name">Meridian Chat</span>
      </div>
      <div className="auth-card">
        <p className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</p>
        <p className="auth-sub">{mode === "login" ? "Sign in to continue chatting" : "Join the conversation"}</p>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Register</button>
        </div>

        <form onSubmit={handle} className="auth-form">
          {mode === "register" && (
            <div className="field">
              <label>Display name</label>
              <input placeholder="Your name" value={form.display_name} onChange={set("display_name")} />
            </div>
          )}
          <div className="field">
            <label>Username</label>
            <input placeholder="Enter username" value={form.username} onChange={set("username")} required autoComplete="username" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Enter password" value={form.password} onChange={set("password")} required autoComplete="current-password" />
          </div>
          {error && <p className="auth-error">⚠ {error}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "login" && (
          <div className="auth-hint">
            <p>Demo credentials</p>
            <div className="auth-hint-row">
              <code>admin / admin123</code>
              <code>alice / alice123</code>
            </div>
            <div className="auth-hint-row">
              <code>bob / bob123</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
