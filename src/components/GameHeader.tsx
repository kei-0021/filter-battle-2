import React from "react";

type GameHeaderProps = {
  theme: string;
  selectedCategory: string;
  filterWords: string[];
};

export const GameHeader: React.FC<GameHeaderProps> = ({
  theme,
  selectedCategory,
  filterWords,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: "200px",
        height: 150,
        background: "#1e1e1e",
        color: "#f5f5f5",
        padding: "1rem 2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>
          お題: <span style={{ color: "#ff6b6b" }}>{theme}</span>
        </h1>
        <h2 style={{ fontSize: "1rem", margin: 0, color: "#6bcfff" }}>
          あなたのフィルター: {selectedCategory}
        </h2>
      </div>

      <div
        style={{
          width: "1000px",
          backgroundColor: "#333",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "0.85rem",
          lineHeight: 1.4,
          maxHeight: "6rem",
          overflowY: "auto",
          userSelect: "none",
          marginBottom: "0.5rem",
          whiteSpace: "normal",
          wordWrap: "break-word",
        }}
      >
        {filterWords?.length ? filterWords.join(", ") : "（フィルター未設定）"}
      </div>
    </div>
  );
};
