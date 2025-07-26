const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const players = new Map();

io.on("connection", (socket) => {
  console.log(`[CONNECT] Socket connected: ${socket.id}`);

  socket.on("join", (name) => {
    players.set(socket.id, name);
    console.log(`[JOIN] Player joined: ${name} (socket: ${socket.id})`);
    console.log(`[PLAYERS] Current players: ${Array.from(players.values()).join(", ")}`);
    io.emit("players", Array.from(players.values()));
  });

  socket.on("submit", (data) => {
    console.log(`[SUBMIT] From ${data.playerName}: "${data.text}" (theme: ${data.theme})`);
    io.emit("newSubmission", data);
  });

  socket.on("disconnect", () => {
    const name = players.get(socket.id);
    players.delete(socket.id);
    console.log(`[DISCONNECT] Player disconnected: ${name || "unknown"} (socket: ${socket.id})`);
    console.log(`[PLAYERS] Current players: ${Array.from(players.values()).join(", ")}`);
    io.emit("players", Array.from(players.values()));
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
