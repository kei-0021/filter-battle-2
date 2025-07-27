// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { PlayerProvider } from "./PlayerContext.js";
import { SocketProvider } from "./SocketContext.js";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);
