import { createContext, ReactNode, useContext } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.PROD
  ? import.meta.env.VITE_SOCKET_URL
  : "http://localhost:3000";

console.log("Socket URL:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};