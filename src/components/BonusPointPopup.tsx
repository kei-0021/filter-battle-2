import { useEffect } from "react";

export function BonusPointPopup({
  playerName,
  bonusPoints,
  filterCategory,
  onClose,
}: {
  playerName: string;
  bonusPoints: number;
  filterCategory: string;
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#222",
          color: "#fff",
          padding: "2rem 3rem",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          fontSize: "1.2rem",
          fontWeight: "bold",
          zIndex: 1001,
          userSelect: "none",
          textAlign: "center",
          whiteSpace: "pre-line",
          lineHeight: "1.6",
        }}
      >
        🎉 {playerName}さんにボーナスポイント！ 🎉{"\n"}
        +{bonusPoints}点{"\n"}
        フィルター：{filterCategory}

        <div style={{ marginTop: "1.2rem" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#fbc02d",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#222",
              fontSize: "1rem",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </>
  );
}
