import { useEffect, useRef, useState } from "react";
import "../styles/bubble-style.css"; // バブル用CSS読み込み
import "../styles/original-style.css"; // 元のCSSも残すなら

type SubmittedCardProps = {
  text: string;
  playerName?: string;
  theme: string;
  filterKeywords?: string[];
  showPokeButton?: boolean;
  useBubbleStyle?: boolean;
};

export function SubmittedCard({
  text,
  playerName,
  theme,
  filterKeywords,
  showPokeButton = false,
  useBubbleStyle = true,
}: SubmittedCardProps) {
  const [visible, setVisible] = useState(false);
  const [fontSize, setFontSize] = useState(30);
  const [wasPoked, setWasPoked] = useState(false);
  const [pokeSuccess, setPokeSuccess] = useState<boolean | null>(null);

  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    const adjustFontSize = () => {
      const textEl = textRef.current;
      const cardEl = cardRef.current;
      if (!textEl || !cardEl) return;

      let currentSize = 30;
      textEl.style.fontSize = `${currentSize}px`;

      while (
        (textEl.scrollHeight > cardEl.clientHeight - 32 || // 少し余裕をもたせる
          textEl.scrollWidth > cardEl.clientWidth - 24) &&
        currentSize > 10
      ) {
        currentSize -= 1;
        textEl.style.fontSize = `${currentSize}px`;
      }

      setFontSize(currentSize);
    };

    adjustFontSize();
  }, [text]);

  const handlePoke = () => {
    const guess = prompt("PlayerNameのフィルターキーワードは？");
    if (!guess) return;
    const success = filterKeywords?.includes(guess) ?? false;
    setPokeSuccess(success);
    setWasPoked(true);
  };

  return (
    <div
      ref={cardRef}
      className={useBubbleStyle ? "bubble-style" : "original-style"}
      style={{
        fontSize: `${fontSize}px`,
        transform: visible ? "translateX(0)" : "translateX(100vw)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s ease-out, opacity 0.4s ease-out",
        ...(!useBubbleStyle ? { padding: "1rem" } : {}),
      }}
    >
      {theme && (
        <div
          className="theme"
          style={{
            color: useBubbleStyle ? "rgba(255 255 255 / 0.8)" : "rgba(0,0,0,0.4)",
            textShadow: useBubbleStyle ? "0 0 5px #0008" : undefined,
          }}
        >
          {theme}
        </div>
      )}

      <div
        ref={textRef}
        style={{
          height: "100%",
          width: "100%",
          wordBreak: "break-word",
          whiteSpace: "normal",
          paddingTop: "1.4rem",
          paddingBottom: playerName ? "30px" : undefined,
          boxSizing: "border-box",
          color: useBubbleStyle ? "#fff" : undefined,
          textShadow: useBubbleStyle ? "0 0 5px #0008" : undefined,
        }}
      >
        {text}
      </div>

      {playerName && (
        <div
          className="playerName"
          style={{
            color: useBubbleStyle ? "rgba(255 255 255 / 0.8)" : "rgba(0,0,0,0.4)",
            textShadow: useBubbleStyle ? "0 0 5px #0008" : undefined,
          }}
        >
          {playerName}
        </div>
      )}

      {!wasPoked && showPokeButton ? (
        <button className="poke-button" onClick={handlePoke}>
          👈 つつく
        </button>
      ) : wasPoked ? (
        <span className={`poke-result ${pokeSuccess ? "poke-success" : "poke-fail"}`}>
          {pokeSuccess ? "🎯 正解！" : "❌ ハズレ"}
        </span>
      ) : null}
    </div>
  );
}
