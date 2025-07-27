import React from "react";
import { Player } from "../types/gameTypes.js";

type ScoreBoardProps = {
  players: Player[];
  currentPlayerName: string;
};

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerName,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 150,
        right: 0,
        width: "200px",
        height: "calc(100vh - 150px)",
        backgroundColor: "#222",
        color: "#eee",
        padding: "1rem",
        overflowY: "auto",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.7)",
        userSelect: "none",
        zIndex: 100,
      }}
    >
      <h3 style={{ marginTop: 0 }}>スコアボード</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {players.length === 0 && <li>参加者なし</li>}
        {players.map((player, idx) => {
          const isMe = player.name === currentPlayerName;

          return (
            <li
              key={idx}
              style={{
                padding: "0.25rem 0",
                borderBottom: "1px solid #444",
                fontWeight: isMe ? "bold" : "normal",
                display: "flex",
                justifyContent: "space-between",
                color: isMe ? "#00ff99" : "#eee",
                backgroundColor: isMe ? "#003300" : "transparent",
                borderRadius: isMe ? "4px" : undefined,
                transition: "background-color 0.3s ease",
              }}
            >
              <span>{player.name}</span>
              <span>{player.score}点</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
