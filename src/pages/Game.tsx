import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SubmittedCard } from "../components/SubmittedCard";
import filters from "../data/filters.json";
import themes from "../data/themes.json";

type SubmittedCardData = {
  text: string;
  playerName: string;
};

export function Game() {
  const [theme, setTheme] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof filters | "">("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCards, setSubmittedCards] = useState<SubmittedCardData[]>([]);
  const [error, setError] = useState("");

  const HEADER_HEIGHT = 150;
  const INPUT_HEIGHT = 160;

  // ここでdivコンテナのrefを用意
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const initializeGame = () => {
    const categories = Object.keys(filters) as (keyof typeof filters)[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setSelectedCategory(randomCategory);
    setKeywords(filters[randomCategory]);
    setKeyword("");
    setSubmitted(false);
    setError("");
  };

  const updateTheme = () => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
    setKeyword("");
    setSubmitted(false);
    setError("");
  };

  // 初期化（1回だけ）
  useEffect(() => {
    initializeGame();
    updateTheme();
  }, []);

  // お題が変わったらフォーカス
  useEffect(() => {
    inputRef.current?.focus();
  }, [theme]);

  // submittedCardsが増えたらスクロールする
  useEffect(() => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollTo({
        top: cardsContainerRef.current.scrollHeight,
        behavior: "smooth",  // ← ここを追加
      });
    }
  }, [submittedCards]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 200) {
      setError("200文字以内で入力してください");
    } else {
      setError("");
    }
    setKeyword(value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing && keyword.trim() && !error && !submitted) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (keyword.trim() && !error) {
      setSubmittedCards((prev) => [...prev, { text: keyword, playerName: "yourPlayerName" }]);
      setSubmitted(true);
      setKeyword("");
    }
  };

  const handleNextTheme = () => {
    updateTheme();
    setSubmitted(false);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
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
          {filters[selectedCategory]?.join(", ")}
        </div>
      </div>

      <div
        ref={cardsContainerRef} // ここでrefをセット
        style={{
          paddingTop: HEADER_HEIGHT + 60,
          paddingBottom: INPUT_HEIGHT + 40,
          height: `calc(100vh - ${HEADER_HEIGHT + INPUT_HEIGHT + 100}px)`,
          overflowY: submittedCards.length > 0 ? "auto" : "hidden",
          backgroundColor: "#1e1e1e",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          display: "block",
          margin: "0 auto",
          maxHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${INPUT_HEIGHT + 40}px)`,
        }}
      >
        {submittedCards.map((card, index) => (
          <div key={index} style={{ marginBottom: index !== submittedCards.length - 1 ? "1rem" : 0 }}>
            <SubmittedCard text={card.text} playerName={card.playerName} />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: INPUT_HEIGHT,
          background: "#1e1e1e",
          padding: "1rem 2rem",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "700px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          gap: "0.3rem",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            ref={inputRef} // ←これが必要
            type="text"
            value={keyword}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}  // ここ追加
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="回答を記入"
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "none",
              outline: "none",
              backgroundColor: "#333",
              color: "#fff",
            }}
            disabled={submitted} // 提出後は入力禁止に
          />
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!keyword.trim() || !!error || submitted}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1.1rem",
                borderRadius: "6px",
                border: "none",
                backgroundColor:
                  !keyword.trim() || !!error || submitted ? "#888" : "#6bffb0",
                color: "#000",
                cursor:
                  !keyword.trim() || !!error || submitted ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              提出
            </button>
          )}
          {submitted && (
            <button
              onClick={handleNextTheme}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              次のテーマへ
            </button>
          )}
        </div>
      </div>
    </>
  );
}
