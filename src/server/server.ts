import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { SCORE_CORRECTLY_POKE, SCORE_CORRECTLY_POKED } from "../constants.js";
import themes from "../data/themes.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://filter-battle-2.onrender.com",
  "http://localhost:5173",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // ここを修正
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const players = new Map<string, { name: string; score: number }>();
const submissionsCount = new Map<string, boolean>();
let currentTheme: string | null = null;

const chooseRandomTheme = (): string => {
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

  socket.on("join", (name: string) => {
    if (!players.has(socket.id)) {
      players.set(socket.id, { name, score: 0 });
    }
    submissionsCount.set(socket.id, false);

    console.log(`[JOIN] ${name} (${socket.id})`);
    if (!currentTheme) {
      currentTheme = chooseRandomTheme();
    }

    broadcastPlayers();
    socket.emit("themeUpdate", currentTheme);

    const allSubmitted = [...submissionsCount.values()].every(Boolean);
    io.emit("allSubmittedStatus", allSubmitted);
  });

  socket.on("submit", (data: { text: string; playerName: string; theme: string; filterCategory: string }) => {
    submissionsCount.set(socket.id, true);
    io.emit("newSubmission", data);

    const allSubmitted = [...submissionsCount.values()].every(Boolean);
    io.emit("allSubmittedStatus", allSubmitted);
  });

  socket.on("pokeResult", ({ attackerName, targetName, isCorrect }: { attackerName: string; targetName: string; isCorrect: boolean }) => {
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

  socket.on("removeCard", ({ targetPlayerName }: { targetPlayerName: string }) => {
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

  socket.on("disconnect", (reason) => {
    const player = players.get(socket.id);
    players.delete(socket.id);
    submissionsCount.delete(socket.id);
    console.log(`[DISCONNECT] ${player?.name || "unknown"} (${socket.id}) - Reason: ${reason}`);
    broadcastPlayers();

    const allSubmitted = [...submissionsCount.values()].every(Boolean);
    io.emit("allSubmittedStatus", allSubmitted);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});