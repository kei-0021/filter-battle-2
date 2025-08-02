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
import filters from "../data/filters.json" with { type: "json" };
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
const submittedCardsInThisRound = new Map<string, number>();
const submittedCards = new Map<string, SubmittedCardData>(); // ここはstringキーのMap
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

function chooseRandomFilterCategory(usedFilters: Set<string>): string {
  const filterCategories = Object.keys(filters);
  const availableFilters = filterCategories.filter(
    (filter) => !usedFilters.has(filter)
  );
  if (availableFilters.length === 0) {
    return filterCategories[Math.floor(Math.random() * filterCategories.length)];
  }
  return availableFilters[Math.floor(Math.random() * availableFilters.length)];
}

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

  submittedCardsInThisRound.set(socket.id, -1);

  socket.on("join", (name) => {
    if (!players.has(socket.id)) {
      players.set(socket.id, { name, score: 0 });
    }

    const usedFilters = new Set<string>();
    for (const card of submittedCards.values()) {
      usedFilters.add(card.filterCategory);
    }
    const assignedFilter = chooseRandomFilterCategory(usedFilters);
    socket.emit("filterAssigned", { category: assignedFilter });
    // 使うときにキーを作る例
    submittedCardsInThisRound.set(socket.id, -1);

    console.log(`[JOIN] ${name} (${socket.id})`);

    if (!currentTheme) {
      currentTheme = chooseRandomTheme();
      currentRound = 0;
      phase = "composing";
    }

    broadcastPlayers();
    socket.emit("roundUpdate", { newTheme: currentTheme, currentRound });
    broadcastPhase();

    const allSubmitted = [...submittedCardsInThisRound.values()].every(
      (roundNum) => roundNum === currentRound
    );
    io.emit("allSubmittedStatus", allSubmitted);
    broadcastPokeHistory();
  });

  socket.on("submit", (data: SubmittedCardData) => {
    submittedCardsInThisRound.set(socket.id, currentRound);
    const cardKey = `${socket.id}_${data.round}`;
    submittedCards.set(cardKey, data);
    io.emit("newSubmission", data);

    const allSubmitted = [...submittedCardsInThisRound.values()].every(
      (roundNum) => roundNum === currentRound
    );
    const card = data;
    console.log(
      `[SUBMIT] name=${card.playerName}, turnIndex=${card.turnIndex}, score=${getScoreForTurn(card.turnIndex)}, currentRound=${currentRound}, phase=${phase}, submissions=${JSON.stringify(
        [...submittedCardsInThisRound.entries()]
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

  socket.on("pokeResult", ({ attackerName, targetName, guess }) => {
    if (pokeHistory.has(attackerName)) return;

    pokeHistory.set(attackerName, true);
    broadcastPokeHistory();

    let targetCard: SubmittedCardData | undefined;
    for (const card of submittedCards.values()) {
      if (card.playerName === targetName) {
        targetCard = card;
        break;
      }
    }
    if (!targetCard) {
      io.to(attackerName).emit("pokeResultNotification", {
        attackerName,
        targetName,
        isCorrect: false,
        turnIndex: null,
        scoreChange: null,
        guess,
      });
      return;
    }

    const isCorrect = guess === targetCard.filterCategory;

    for (const player of players.values()) {
      if (isCorrect) {
        if (player.name === attackerName) {
          player.score += getScoreForTurn(targetCard.turnIndex);
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

    if (isCorrect) {
      // 1. 使われているフィルターを取得
      const usedFilters = new Set<string>();
      for (const card of submittedCards.values()) {
        usedFilters.add(card.filterCategory);
      }

      // 2. 新しいフィルターを取得（使えるものがなければ全体からランダムに選ぶ）
      const newFilter = chooseRandomFilterCategory(usedFilters);

      // 3. カードを削除　＆　4. 新しいフィルター通知　＆　5. 削除通知
      for (const [cardKey, card] of submittedCards.entries()) {
        if (card.playerName === targetName) {
          submittedCards.delete(cardKey);

          // 新しいフィルターをクライアントに通知
          io.to(cardKey.split('_')[0]).emit("filterAssigned", { category: newFilter });

          // 全体にカード削除を通知（UIでカードを消す用）
          io.emit("removeCard", { targetPlayerName: targetName, turnIndex: card.turnIndex });

          break; // 1枚だけ削除するならbreak
        }
      }
    }

    broadcastPlayers();

    io.emit("pokeResultNotification", {
      attackerName,
      targetName,
      isCorrect,
      turnIndex: targetCard.turnIndex,
      scoreChange: isCorrect ? getScoreForTurn(targetCard.turnIndex) : SCORE_FAILED_POKE * -1,
      guess,
    });
  });

  socket.on("removeCard", ({ targetPlayerName, turnIndex }) => {
    io.emit("removeCard", { targetPlayerName, turnIndex });
  });

  socket.on("nextTheme", () => {
    currentTheme = chooseRandomTheme();
    currentRound++;
    phase = "composing";

    for (const key of submittedCardsInThisRound.keys()) {
      submittedCardsInThisRound.set(key, -1);
    }
    pokeHistory.clear();

    broadcastPlayers();
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
    if (phase === "finished") return;

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

        const scoredPlayers = new Set<string>();
        for (const card of submittedCards.values()) {
          const playerName = card.playerName;

          if (scoredPlayers.has(playerName)) continue;

          const playerCards = [...submittedCards.values()].filter(
            (c) => c.playerName === playerName
          );

          const hasOnePointCard = playerCards.some((c) => c.score === 1);

          if (hasOnePointCard) {
            // ✅ ここで score プロパティを直接合計する
            const totalScore = playerCards.reduce((sum, c) => sum + c.score, 0);

            const player = [...players.values()].find((p) => p.name === playerName);
            if (player) {
              console.log(`プレイヤー ${playerName} のカード一覧:`, playerCards);
              player.score += totalScore;
              console.log(`プレイヤーにボーナスポイント (${playerName}) +${totalScore}`);
            }
          }

          scoredPlayers.add(playerName);
        }

        broadcastPlayers();
      }
      set.clear();
    }
  });

  socket.on("disconnect", (reason) => {
    const player = players.get(socket.id);
    players.delete(socket.id);
    submittedCardsInThisRound.delete(socket.id);
    console.log(
      `[DISCONNECT] ${player?.name || "unknown"} (${socket.id}) - Reason: ${reason}`
    );
    broadcastPlayers();

    const allSubmitted = [...submittedCardsInThisRound.values()].every(
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
