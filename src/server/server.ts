import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import {
  getScoreForTurn,
  SCORE_CORRECTLY_POKED,
  SCORE_FAILED_POKE,
  THINKING_TIME_LIMIT,
} from "../constants.js";
import themes from "../data/themes.json" with { type: "json" };
import { SubmittedCardData } from "../types/gameTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://filter-battle-2.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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
const submissionsCount = new Map<string, number>(); // socket.id → 提出ラウンド番号 or -1 未提出
const pokeHistory = new Map<string, boolean>();
const timeUpMap = {
  composing: new Set<string>(),
  thinking: new Set<string>(),
  poking: new Set<string>(),
};

let currentTheme: string | null = null;
let currentRound = 0;
type Phase = "composing" | "thinking" | "poking" | "finished";
let phase: Phase = "composing";

let thinkingTimer: NodeJS.Timeout | null = null;

const chooseRandomTheme = () => {
  const idx = Math.floor(Math.random() * themes.length);
  return themes[idx];
};

const broadcastPlayers = () => {
  io.emit("playersUpdate", Array.from(players.values()));
};

const broadcastPokeHistory = () => {
  io.emit("pokeDonePlayersUpdate", Array.from(pokeHistory.keys()));
};

const broadcastPhase = () => {
  io.emit("phaseUpdate", phase);
};

io.on("connection", (socket) => {
  console.log(`[CONNECT] ${socket.id}`);

  submissionsCount.set(socket.id, -1);

  socket.on("join", (name) => {
    if (!players.has(socket.id)) {
      players.set(socket.id, { name, score: 0 });
    }
    submissionsCount.set(socket.id, -1);

    console.log(`[JOIN] ${name} (${socket.id})`);

    if (!currentTheme) {
      currentTheme = chooseRandomTheme();
      currentRound = 0;
      phase = "composing";
    }

    broadcastPlayers();
    socket.emit("roundUpdate", { newTheme: currentTheme, currentRound });
    broadcastPhase();

    const allSubmitted = [...submissionsCount.values()].every(
      (roundNum) => roundNum === currentRound
    );
    io.emit("allSubmittedStatus", allSubmitted);
    broadcastPokeHistory();
  });

  socket.on("submit", (data: SubmittedCardData) => {
    submissionsCount.set(socket.id, currentRound);
    io.emit("newSubmission", data);

    const allSubmitted = [...submissionsCount.values()].every(
      (roundNum) => roundNum === currentRound
    );

    console.log(
      `[SUBMIT] currentRound=${currentRound}, phase=${phase}, submissions=${JSON.stringify(
        [...submissionsCount.entries()]
      )}, allSubmitted=${allSubmitted}`
    );

    if (allSubmitted && phase === "composing") {
      phase = "thinking";
      broadcastPhase();

      if (thinkingTimer) clearTimeout(thinkingTimer);
      thinkingTimer = setTimeout(() => {
        phase = "poking";
        broadcastPhase();
        io.emit("startPoking");
      }, THINKING_TIME_LIMIT * 1000);
    }

    io.emit("allSubmittedStatus", allSubmitted);
  });

  socket.on("pokeResult", ({ attackerName, targetName, isCorrect, turnIndex }) => {
    if (pokeHistory.has(attackerName)) return;

    pokeHistory.set(attackerName, true);
    broadcastPokeHistory();

    for (const player of players.values()) {
      if (isCorrect) {
        if (player.name === attackerName) {
          player.score += getScoreForTurn(turnIndex);
        }
        if (player.name === targetName) {
          player.score -= SCORE_CORRECTLY_POKED;
        }
      } else {
        if (player.name === attackerName) {
          player.score -= SCORE_FAILED_POKE;
        }
      }
    }
    broadcastPlayers();
  });

  socket.on("removeCard", ({ targetPlayerName, turnIndex }) => {
    io.emit("removeCard", { targetPlayerName, turnIndex });
  });

  socket.on("nextTheme", () => {
    currentTheme = chooseRandomTheme();
    currentRound++;
    phase = "composing";

    for (const key of submissionsCount.keys()) {
      submissionsCount.set(key, -1);
    }
    pokeHistory.clear();

    broadcastPlayers();  // ここでプレイヤー情報を送る
    io.emit("pokeDonePlayersUpdate", []);
    io.emit("roundUpdate", { newTheme: currentTheme, currentRound });
    io.emit("allSubmittedStatus", false);
    broadcastPhase();

    if (thinkingTimer) {
      clearTimeout(thinkingTimer);
      thinkingTimer = null;
    }

    timeUpMap.composing.clear();
    timeUpMap.thinking.clear();
    timeUpMap.poking.clear();
  });

  socket.on("timeUp", ({ phase: clientPhase }) => {
    if (clientPhase !== phase) return;
    if (phase === "finished") return; // ← この行を追加

    console.log(`[timeUp] phase=${phase}, received from ${socket.id}`);

    const set = timeUpMap[phase];
    set.add(socket.id);

    console.log(`[timeUp] current ${phase} timeUpPlayers:`, Array.from(set));
    console.log(`[timeUp] ${phase} timeUpPlayers.size=${set.size}, players.size=${players.size}`);

    if (set.size === players.size) {
      if (phase === "composing") {
        phase = "thinking";
        broadcastPhase();

        if (thinkingTimer) clearTimeout(thinkingTimer);
        thinkingTimer = setTimeout(() => {
          phase = "poking";
          broadcastPhase();
          io.emit("startPoking");
        }, THINKING_TIME_LIMIT * 1000);

      } else if (phase === "thinking") {
        phase = "poking";
        broadcastPhase();
        io.emit("startPoking");

      } else if (phase === "poking") {
        phase = "finished";
        broadcastPhase();
      }

      set.clear(); // 対象フェーズの timeUpPlayers をリセット
    }
  });

  socket.on("disconnect", (reason) => {
    const player = players.get(socket.id);
    players.delete(socket.id);
    submissionsCount.delete(socket.id);
    console.log(
      `[DISCONNECT] ${player?.name || "unknown"} (${socket.id}) - Reason: ${reason}`
    );
    broadcastPlayers();

    const allSubmitted = [...submissionsCount.values()].every(
      (roundNum) => roundNum === currentRound
    );
    io.emit("allSubmittedStatus", allSubmitted);

    if (player) {
      pokeHistory.delete(player.name);
      broadcastPokeHistory();
    }

    timeUpMap.composing.clear();
    timeUpMap.thinking.clear();
    timeUpMap.poking.clear();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
