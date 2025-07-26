const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const themes = require("../data/themes.json"); // 外部ファイルからテーマ読み込み

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const players = new Map(); // socket.id => playerName
const submissionsCount = new Map(); // socket.id => true/false（提出済みか）
let currentTheme = null;

const chooseRandomTheme = () => {
  const idx = Math.floor(Math.random() * themes.length);
  return themes[idx];
};

io.on("connection", (socket) => {
  console.log(`[CONNECT] Socket connected: ${socket.id}`);

  // 新規接続時は提出フラグ初期化
  submissionsCount.set(socket.id, false);

  socket.on("join", (name) => {
    players.set(socket.id, name);
    submissionsCount.set(socket.id, false); // 加入時は未提出

    console.log(`[JOIN] Player joined: ${name} (socket: ${socket.id})`);
    console.log(`[PLAYERS] Current players: ${Array.from(players.values()).join(", ")}`);

    if (!currentTheme) {
      currentTheme = chooseRandomTheme();
    }

    io.emit("playersUpdate", Array.from(players.values()));
    socket.emit("themeUpdate", currentTheme);

    // 加入時に全員提出済みかもチェック
    const allSubmitted = Array.from(submissionsCount.values()).every((v) => v === true);
    io.emit("allSubmittedStatus", allSubmitted);
  });

  socket.on("submit", (data) => {
    submissionsCount.set(socket.id, true);
    console.log(`[SUBMIT] From ${data.playerName}: "${data.text}" (theme: ${data.theme})`);
    io.emit("newSubmission", data);

    // 全員提出済みかチェックして送信
    const allSubmitted = Array.from(submissionsCount.values()).every((v) => v === true);
    io.emit("allSubmittedStatus", allSubmitted);
  });

  socket.on("nextTheme", () => {
    currentTheme = chooseRandomTheme();

    // テーマ切り替え時は提出状況リセット
    submissionsCount.forEach((_, key) => submissionsCount.set(key, false));

    io.emit("themeUpdate", currentTheme);
    io.emit("allSubmittedStatus", false);
    console.log(`[THEME] Theme changed to: ${currentTheme}`);
  });

  socket.on("disconnect", () => {
    const name = players.get(socket.id);
    players.delete(socket.id);
    submissionsCount.delete(socket.id);

    console.log(`[DISCONNECT] Player disconnected: ${name || "unknown"} (socket: ${socket.id})`);
    console.log(`[PLAYERS] Current players: ${Array.from(players.values()).join(", ")}`);

    io.emit("playersUpdate", Array.from(players.values()));

    // 切断後に全員提出済みか再チェック
    const allSubmitted = Array.from(submissionsCount.values()).every((v) => v === true);
    io.emit("allSubmittedStatus", allSubmitted);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
