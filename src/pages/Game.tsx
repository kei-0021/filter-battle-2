import { useEffect, useState } from "react";
import { SubmittedCard } from "../components/SubmittedCard";
import filters from "../data/filters.json";
import themes from "../data/themes.json";

export function Game() {
  const [theme, setTheme] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof filters | "">("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 初期化処理（フィルターもセット）
  const initializeGame = () => {
    const categories = Object.keys(filters) as (keyof typeof filters)[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setSelectedCategory(randomCategory);

    const selectedKeywords = filters[randomCategory];
    setKeywords(selectedKeywords);

    setKeyword("");
    setSubmitted(false);

    // ここではテーマはセットしない
  };

  // 「次へ」でテーマだけ更新する処理
  const updateTheme = () => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
    setKeyword("");
    setSubmitted(false);
  };

  // 最初だけ初期化してテーマもセット
  useEffect(() => {
    initializeGame();
    updateTheme();
  }, []);

  const handleSubmit = () => {
    if (keyword.trim()) {
      setSubmitted(true);
    }
  };

  const handleNextTheme = () => {
    updateTheme();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1e1e1e", color: "#f5f5f5", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        お題: <span style={{ color: "#ff6b6b" }}>{theme}</span>
      </h1>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#6bcfff" }}>
        あなたのフィルター: {selectedCategory}
      </h2>
      <div
        style={{
          backgroundColor: "#333",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "0.85rem",
          lineHeight: 1.4,
          maxWidth: "600px",
          marginBottom: "1.5rem",
          userSelect: "none",
        }}
      >
        {filters[selectedCategory]?.join(", ")}
      </div>

      {!submitted ? (
        <>
          <p style={{ marginBottom: "1rem" }}>このお題に沿って回答を1つ記入してください。</p>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="回答を記入"
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
        <SubmittedCard text={keyword} playerName={"yourPlayerName"} />
      )}

      {submitted && (
        <div style={{ marginTop: "4rem", textAlign: "center" }}>
          <button
            onClick={handleNextTheme}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            次のテーマへ
          </button>
        </div>
      )}
    </div>
  );
}
