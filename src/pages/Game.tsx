import { useEffect, useState } from "react";
import filters from "../data/filters.json";
import themes from "../data/themes.json";

export function Game() {
  const [theme, setTheme] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof filters | "">("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // 初回マウント時にランダムでお題を選ぶ
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);

    // カテゴリのキー一覧を取得
    const categories = Object.keys(filters) as (keyof typeof filters)[];
    // ランダムにカテゴリ選択
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setSelectedCategory(randomCategory);

    // 選ばれたカテゴリの全キーワードをセット
    const selectedKeywords = filters[randomCategory];
    setKeywords(selectedKeywords);

    // そのカテゴリのキーワードからランダムに1つフィルター用に選ぶ
    const randomFilter = selectedKeywords[Math.floor(Math.random() * selectedKeywords.length)];
    setFilter(randomFilter);
  }, []);

  const handleSubmit = () => {
    if (keyword.trim()) {
      setSubmitted(true);
      // 今後: Socket.IOで送信など
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1e1e1e", color: "#f5f5f5", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        お題: <span style={{ color: "#ff6b6b" }}>{theme}</span>
      </h1>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#6bcfff" }}>
        フィルター: {selectedCategory}
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
          <p style={{ marginBottom: "1rem" }}>このお題に沿ってカードを1つ記入してください。</p>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="カードに記入"
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
        <p>カード「{keyword}」を提出しました。結果を待っています...</p>
      )}
    </div>
  );
}
