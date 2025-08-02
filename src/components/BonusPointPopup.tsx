import { useEffect } from "react";

export function BonusPointPopup({
  playerName,
  bonusPoints,
  onClose,
}: {
  playerName: string;
  bonusPoints: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
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
          fontWeight: "bold",
          zIndex: 1001,
          userSelect: "none",
          textAlign: "center",
          minWidth: "250px",
        }}
      >
        <div>🎉 {playerName}さんにボーナスポイント +{bonusPoints} ポイント！ 🎉</div>
        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#fbc02d",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#222",
          }}
        >
          閉じる
        </button>
      </div>
    </>
  );
}
