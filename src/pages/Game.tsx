import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SubmittedCard } from "../components/SubmittedCard";
import filters from "../data/filters.json";
import { usePlayer } from "../PlayerContext";

type SubmittedCardData = {
  text: string;
  playerName: string;
  theme: string;
};

type Player = {
  name: string;
};

let socket: Socket;

export function Game() {
  const { playerName } = usePlayer();

  const [theme, setTheme] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof filters | "">("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCards, setSubmittedCards] = useState<SubmittedCardData[]>([]);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [allSubmitted, setAllSubmitted] = useState(false); // ←追加

  const HEADER_HEIGHT = 150;
  const INPUT_HEIGHT = 120;

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // カテゴリ選択は最初だけ
  useEffect(() => {
    const categories = Object.keys(filters) as (keyof typeof filters)[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setSelectedCategory(randomCategory);
    setKeywords(filters[randomCategory]);
  }, []);

  useEffect(() => {
    console.log("Socket.IO接続開始...");
    socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Socket.IO connected, id:", socket.id);
      if (playerName) {
        socket.emit("join", playerName);
        console.log("joinイベント送信:", playerName);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connect_error:", err);
    });

    socket.on("newSubmission", (data: SubmittedCardData) => {
      console.log("newSubmissionイベント受信:", data);
      setSubmittedCards((prev) => [...prev, data]);
    });

    socket.on("playersUpdate", (updatedPlayers: string[]) => {
      console.log("playersUpdateイベント受信:", updatedPlayers);
      setPlayers(updatedPlayers.map((name) => ({ name })));
    });

    socket.on("themeUpdate", (newTheme: string) => {
      console.log("themeUpdateイベント受信:", newTheme);
      setTheme(newTheme);
      setSubmitted(false);
      setKeyword("");
      setAllSubmitted(false); // 新テーマなのでリセット
    });

    socket.on("allSubmittedStatus", (status: boolean) => {
      console.log("allSubmittedStatusイベント受信:", status);
      setAllSubmitted(status);
    });

    return () => {
      console.log("Socket.IO切断");
      socket.disconnect();
    };
  }, [playerName]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [theme]);

  useEffect(() => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollTo({
        top: cardsContainerRef.current.scrollHeight,
        behavior: "smooth",
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
      const newCard = {
        text: keyword,
        playerName: playerName || "名無し",
        theme,
      };
      console.log("submitイベント送信:", newCard);
      socket.emit("submit", newCard);
      setSubmitted(true);
      setKeyword("");
    }
  };

  // 「次のテーマへ」ボタンは全員提出済みかつ自分が提出済みなら表示・有効化
  const handleNextTheme = () => {
    socket.emit("nextTheme");
  };

  return (
    <>
      {/* ヘッダー */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: "200px",
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

      {/* メインカード表示エリア */}
      <div
        ref={cardsContainerRef}
        style={{
          position: "fixed",
          top: 0,
          bottom: INPUT_HEIGHT,
          left: 0,
          right: "200px",
          overflowY: submittedCards.length > 0 ? "auto" : "hidden",
          backgroundColor: "#1e1e1e",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          paddingTop: HEADER_HEIGHT * 1.4,
          boxSizing: "border-box",
          zIndex: 50,
        }}
      >
        {submittedCards.map((card, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <SubmittedCard
              text={card.text}
              theme={card.theme}
              playerName={card.playerName}
              filterKeywords={filters[selectedCategory] || []}
              showPokeButton={index === submittedCards.length - 1}
              useBubbleStyle={true}
            />
          </div>
        ))}
      </div>

      {/* 右サイド プレイヤー一覧 */}
      <div
        style={{
          position: "fixed",
          top: HEADER_HEIGHT,
          right: 0,
          width: "200px",
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          backgroundColor: "#222",
          color: "#eee",
          padding: "1rem",
          overflowY: "auto",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.7)",
          userSelect: "none",
          zIndex: 100,
        }}
      >
        <h3 style={{ marginTop: 0 }}>プレイヤー一覧</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {players.length === 0 && <li>参加者なし</li>}
          {players.map((player, idx) => (
            <li
              key={idx}
              style={{
                padding: "0.25rem 0",
                borderBottom: "1px solid #444",
                fontWeight: player.name === playerName ? "bold" : "normal",
              }}
            >
              {player.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 入力エリア */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: "200px",
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
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
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
            disabled={submitted}
          />
          <div
            style={{
              color: "#aaa",
              fontSize: "0.9rem",
              marginTop: "0.2rem",
              textAlign: "right",
            }}
          >
            {keyword.length} / 200
          </div>

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
                  !keyword.trim() || !!error || submitted
                    ? "not-allowed"
                    : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              提出
            </button>
          )}
          {submitted && (
            <button
              onClick={handleNextTheme}
              disabled={!allSubmitted} // みんな提出済みでないと押せないように
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: allSubmitted ? "#007bff" : "#555",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: allSubmitted ? "pointer" : "not-allowed",
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
