import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
axios.defaults.baseURL = "https://chat-app-f5vd.onrender.com";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("chat_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const stored = localStorage.getItem("chat_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post("/api/auth/login", { username, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem("chat_token", t);
    localStorage.setItem("chat_user", JSON.stringify(u));
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (username, password, display_name) => {
    const res = await axios.post("/api/auth/register", { username, password, display_name });
    const { token: t, user: u } = res.data;
    localStorage.setItem("chat_token", t);
    localStorage.setItem("chat_user", JSON.stringify(u));
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
