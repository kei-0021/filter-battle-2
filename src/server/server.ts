import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { SCORE_CORRECTLY_POKE, SCORE_CORRECTLY_POKED } from "../constants.js";
import themes from "../data/themes.json" with { type: "json" };

// ESM環境で __dirname 取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// CORS制限（必要に応じてURLを編集してください）
const allowedOrigins = [
  "https://filter-battle-2.onrender.com",
  "http://localhost:5173",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// 静的ファイルの提供（Viteのビルド成果物が../../distにある想定）
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

// SPA対応: 全てのGETリクエストにindex.html返す
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Socket.IOロジック
const players = new Map(); // socket.id => { name, score }
const submissionsCount = new Map(); // socket.id => boolean
let currentTheme = null;

const chooseRandomTheme = () => {
  const idx = Math.floor(Math.random() * themes.length);
  return themes[idx];
};

const broadcastPlayers = () => {
  const playerList = Array.from(players.values());
  io.emit("playersUpdate", playerList);
};

io.on("connection", (socket) => {
  console.log(`[CONNECT] ${socket.id}`);
  submissionsCount.set(socket.id, false);

  socket.on("join", (name) => {
    if (!players.has(socket.id)) {
      players.set(socket.id, { name, score: 0 });
    }
    submissionsCount.set(socket.id, false);

    console.log(`[JOIN] ${name} (${socket.id})`);
    if (!currentTheme) currentTheme = chooseRandomTheme();

    broadcastPlayers();
    socket.emit("themeUpdate", currentTheme);

    const allSubmitted = [...submissionsCount.values()].every(Boolean);
    io.emit("allSubmittedStatus", allSubmitted);
  });

  socket.on("submit", (data) => {
    submissionsCount.set(socket.id, true);
    io.emit("newSubmission", data);

    const allSubmitted = [...submissionsCount.values()].every(Boolean);
    io.emit("allSubmittedStatus", allSubmitted);
  });

  socket.on("pokeResult", ({ attackerName, targetName, isCorrect }) => {
    for (const player of players.values()) {
      if (player.name === attackerName && isCorrect) {
        player.score += SCORE_CORRECTLY_POKE;
      }
      if (player.name === targetName && isCorrect) {
        player.score -= SCORE_CORRECTLY_POKED;
      }
    }
    broadcastPlayers();
  });

  socket.on("removeCard", ({ targetPlayerName }) => {
    io.emit("removeCard", { targetPlayerName });
  });

  socket.on("nextTheme", () => {
    currentTheme = chooseRandomTheme();
    for (const key of submissionsCount.keys()) {
      submissionsCount.set(key, false);
    }
    io.emit("themeUpdate", currentTheme);
    io.emit("allSubmittedStatus", false);
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    players.delete(socket.id);
    submissionsCount.delete(socket.id);
    console.log(`[DISCONNECT] ${player?.name || "unknown"} (${socket.id})`);
    broadcastPlayers();

    const allSubmitted = [...submissionsCount.values()].every(Boolean);
    io.emit("allSubmittedStatus", allSubmitted);
  });
});

// Render環境で必ずPORTを使う
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
