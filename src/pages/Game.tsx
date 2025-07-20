import { useState } from "react";

export function Game() {
  const [theme, setTheme] = useState("旅");
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (keyword.trim()) {
      setSubmitted(true);
      // Socket.IOで送信など後で実装予定
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1e1e1e",
        color: "#f5f5f5",
        padding: "2rem",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>お題: <span style={{ color: "#ff6b6b" }}>{theme}</span></h1>

      {!submitted ? (
        <>
          <p style={{ marginBottom: "1rem" }}>このお題に沿ってキーワードを1つ入力してください。</p>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワードを入力"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "none",
              outline: "none",
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#333",
              color: "#fff",
              marginBottom: "1rem",
            }}
          />
          <br />
          <button
            onClick={handleSubmit}
            disabled={!keyword.trim()}
            style={{
              padding: "0.75rem 2rem",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: keyword.trim() ? "#6bffb0" : "#888",
              color: "#000",
              cursor: keyword.trim() ? "pointer" : "not-allowed",
            }}
          >
            提出
          </button>
        </>
      ) : (
        <p>キーワード「{keyword}」を提出しました。結果を待っています...</p>
      )}
    </div>
  );
}
