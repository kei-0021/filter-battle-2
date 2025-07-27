import { SCORE_CORRECTLY_POKE, SCORE_CORRECTLY_POKED } from "../constants.js";

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const themes = require("../data/themes.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

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
  console.log(`[CONNECT] Socket connected: ${socket.id}`);
  submissionsCount.set(socket.id, false);

  socket.on("join", (name) => {
    if (!players.has(socket.id)) {
      players.set(socket.id, { name, score: 0 });
    }
    submissionsCount.set(socket.id, false);

    console.log(`[JOIN] ${name} (socket: ${socket.id})`);
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
      if (player.name === attackerName && isCorrect) player.score += SCORE_CORRECTLY_POKE;
      if (player.name === targetName && isCorrect) player.score -= SCORE_CORRECTLY_POKED;
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
    console.log(`[DISCONNECT] ${player?.name || "unknown"} (socket: ${socket.id})`);
    broadcastPlayers();

    const allSubmitted = [...submissionsCount.values()].every(Boolean);
    io.emit("allSubmittedStatus", allSubmitted);
  });
});

server.listen(3001, () => {
  console.log("Socket.IO server running on port 3001");
});
