import { CSSPoperties, useEffect, useRef, useState } from "react";

type SubmittedCardProps = {
  text: string;
  playerName?: string;
  style?: CSSPoperties
};

export function SubmittedCard({ text, playerName }: SubmittedCardProps) {
  const [visible, setVisible] = useState(false);
  const [fontSize, setFontSize] = useState(24); // 初期フォントサイズ
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  // テキストサイズ調整
  useEffect(() => {
    const adjustFontSize = () => {
      const textEl = textRef.current;
      const cardEl = cardRef.current;
      if (!textEl || !cardEl) return;

      let currentSize = 24; // 初期サイズ
      textEl.style.fontSize = `${currentSize}px`;

      while (
        (textEl.scrollHeight > cardEl.clientHeight - 28 || // 名前分の余白確保（28px）
          textEl.scrollWidth > cardEl.clientWidth - 20) &&
        currentSize > 10
      ) {
        currentSize -= 1;
        textEl.style.fontSize = `${currentSize}px`;
      }
      setFontSize(currentSize);
    };

    adjustFontSize();
  }, [text]);

  return (
    <div
      ref={cardRef}
      style={{
        position: "relative",
        display: "inline-block",
        width: "400px",
        height: "160px",
        backgroundColor: "#6bffb0",
        color: "#000",
        padding: "1rem",
        borderRadius: "16px",
        boxShadow: "0 6px 14px rgba(107, 255, 176, 0.7)",
        fontSize: `${fontSize}px`,
        fontWeight: "700",
        userSelect: "none",
        transform: visible ? "translateX(0)" : "translateX(100vw)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s ease-out, opacity 0.4s ease-out",
        overflow: "hidden",
      }}
    >
      <div
        ref={textRef}
        style={{
          height: "100%",
          width: "100%",
          wordBreak: "break-word",
          whiteSpace: "normal",
          paddingBottom: playerName ? "28px" : undefined, // 名前の領域分パディングを追加
          boxSizing: "border-box",
        }}
      >
        {text}
      </div>

      {playerName && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "12px",
            fontSize: "0.75rem",
            color: "rgba(0,0,0,0.4)",
            fontWeight: "500",
            userSelect: "none",
          }}
        >
          {playerName}
        </div>
      )}
    </div>
  );
}
