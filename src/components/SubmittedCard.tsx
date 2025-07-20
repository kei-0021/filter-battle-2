import { useEffect, useState } from "react";

type SubmittedCardProps = {
  text: string;
  playerName?: string; // プレーヤー名はオプションで受け取る想定
};

export function SubmittedCard({ text, playerName }: SubmittedCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        backgroundColor: "#6bffb0",
        color: "#000",
        padding: "2rem 3rem",
        borderRadius: "16px",
        boxShadow: "0 6px 14px rgba(107, 255, 176, 0.7)",
        fontSize: "2rem",
        fontWeight: "700",
        userSelect: "none",
        transform: visible ? "translateX(0)" : "translateX(100vw)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s ease-out, opacity 0.4s ease-out",
        whiteSpace: "nowrap",
      }}
    >
      {text}
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
