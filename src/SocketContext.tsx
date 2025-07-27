import { createContext, ReactNode, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  // socketは初回のみ作るが、ここはモジュールスコープのものを使う方が良い場合もある
  // const socket = useMemo(() => io(SOCKET_URL, { transports: ["websocket"] }), []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
