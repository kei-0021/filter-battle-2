import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { SCORE_CORRECTLY_POKE, SCORE_CORRECTLY_POKED } from "../constants.js";
import themes from "../data/themes.json" with { type: "json" };

// __dirname 相当 (ESM対応)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// フロントエンド（dist）の静的ファイル配信
app.use(express.static(path.join(__dirname, "../../dist")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

// Socket.IO ロジック
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

// Render環境では PORT を必ず環境変数から取る
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
