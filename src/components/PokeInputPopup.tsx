import { KeyboardEvent, useEffect, useState } from "react";

type PokeInputPopupProps = {
  targetPlayerName: string | null;
  turnIndex?: number | null;  // ここを追加
  onSubmit: (input: string) => void;
  onClose: () => void;
};

export function PokeInputPopup({ targetPlayerName, onSubmit, onClose }: PokeInputPopupProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    setInput("");
  }, [targetPlayerName]);

  if (!targetPlayerName) return null;

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#222",
          color: "#fff",
          padding: "1.5rem 2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          fontSize: "1.2rem",
          zIndex: 1001,
          userSelect: "none",
          minWidth: "300px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          {targetPlayerName}のフィルターはズバリ...？
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: "100%",
            padding: "0.5rem",
            fontSize: "1rem",
            borderRadius: "4px",
            border: "none",
            outline: "none",
            marginBottom: "1rem",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: input.trim() ? "#6bffb0" : "#555",
            color: "#000",
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          判定する
        </button>
      </div>
    </>
  );
}
