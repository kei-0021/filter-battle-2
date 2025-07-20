import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 追加

export function Title(props: { onJoin: (name: string) => void }) {
  const [inputName, setInputName] = useState("");
  const navigate = useNavigate(); // 追加

  const handleJoinClick = () => {
    if (inputName.trim()) {
      props.onJoin(inputName.trim());
      navigate("/game"); // ← ここを置き換え
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJoinClick();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* 左側 */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(to bottom right, #1c1c1c, #343a40)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ transform: "rotate(-90deg)", opacity: 0.4, fontSize: "2rem" }}>
          YOU
        </h2>
      </div>

      {/* 中央（フォーム） */}
      <div
        style={{
          width: "480px",
          maxWidth: "90vw",
          background: "#222",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          zIndex: 1,
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Filter Battle 2</h1>
        <p style={{ opacity: 0.8, marginBottom: "2rem", fontSize: "1.1rem", textAlign: "center" }}>
          あなたの推理でフィルターを見抜け！<br />
          名前を入力して参加しよう。
        </p>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="名前を入力"
          style={{
            padding: "0.75rem 1rem",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "none",
            outline: "none",
            width: "100%",
            marginBottom: "1rem",
            backgroundColor: "#444",
            color: "#fff",
            boxShadow: "inset 0 0 5px rgba(255,255,255,0.1)",
          }}
        />
        <button
          onClick={handleJoinClick}
          disabled={!inputName.trim()}
          style={{
            padding: "0.75rem 2rem",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: inputName.trim() ? "#ff5f5f" : "#888",
            color: "#fff",
            cursor: inputName.trim() ? "pointer" : "not-allowed",
            boxShadow: inputName.trim()
              ? "0 4px 12px rgba(255,95,95,0.6)"
              : "none",
            transition: "all 0.3s ease",
          }}
        >
          参加する
        </button>
      </div>

      {/* 右側 */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(to top left, #1c1c1c, #3a3f44)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ transform: "rotate(90deg)", opacity: 0.4, fontSize: "2rem" }}>
          THEM
        </h2>
      </div>
    </div>
  );
}
