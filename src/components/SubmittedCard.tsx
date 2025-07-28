// SubmittedCard.tsx
import { useEffect, useRef, useState } from "react";
import "../styles/bubble-style.css";

type SubmittedCardProps = {
  text: string;
  playerName?: string;
  theme: string;
  filterKeywords?: string[];
  score?: number;
  showPokeButton?: boolean;
  useBubbleStyle?: boolean;
  pokeResult?: boolean | null;
  onPoke?: () => void;
};

export function SubmittedCard({
  text,
  playerName,
  theme,
  filterKeywords,
  score,
  showPokeButton = false,
  useBubbleStyle = true,
  pokeResult = null,
  onPoke,
}: SubmittedCardProps) {
  const [visible, setVisible] = useState(false);
  const [fontSize, setFontSize] = useState(30);
  const [isPopped, setIsPopped] = useState(false);

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
        (textEl.scrollHeight > cardEl.clientHeight - 32 ||
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

  // つつき成功したら割れるアニメーション開始＆非表示
  useEffect(() => {
    if (pokeResult === true) {
      setIsPopped(true);
      const timer = setTimeout(() => setVisible(false), 500); // アニメーション長に合わせる
      return () => clearTimeout(timer);
    }
  }, [pokeResult]);

  if (!visible) return null;

  return (
    <div
      ref={cardRef}
      className={`${useBubbleStyle ? "bubble-style" : ""} ${
        isPopped ? "bubble-pop" : ""
      } slide-in`}
      style={{
        fontSize: `${fontSize}px`,
        padding: !useBubbleStyle ? "1rem" : undefined,
      }}
    >
      {/* うっすら得点表示 */}
      {score !== undefined && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "4rem",         // 大きめサイズに
            fontWeight: "900",
            color: "rgba(255, 255, 255, 0.1)", // さらに薄めに
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
            whiteSpace: "nowrap",
          }}
        >
          {score}
        </div>
      )}
      {theme && (
        <div
          className="theme"
          style={{
            color: useBubbleStyle ? "rgba(255 255 255 / 0.8)" : "rgba(0,0,0,0.4)",
            textShadow: useBubbleStyle ? "0 0 5px #0008" : undefined,
            paddingLeft: "0.8rem",   // ← 左側に余白
            paddingTop: "0.4rem",    // ← 上側に余白
            position: "absolute",    // 親のpositionがrelativeなら絶対位置指定もOK
            top: 0,
            left: 0,
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

      {showPokeButton && pokeResult === null && onPoke && (
        <button className="poke-button" onClick={onPoke}>
          👈 つつく
        </button>
      )}
    </div>
  );
}
