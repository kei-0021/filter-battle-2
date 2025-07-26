import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PlayerProvider } from "./PlayerContext"; // ← 追加

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlayerProvider> {/* ← ここでラップ */}
        <App />
      </PlayerProvider>
    </BrowserRouter>
  </React.StrictMode>
);
