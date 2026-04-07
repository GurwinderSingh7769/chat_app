import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocket(token) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    const socket = io("https://chat-app-f5vd.onrender.com", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("authenticate", { token });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("online_users", (users) => setOnlineUsers(users));

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { socket: socketRef.current, connected, onlineUsers };
}
