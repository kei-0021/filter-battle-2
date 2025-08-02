import { useEffect } from "react";

type PokeResultPopupProps = {
  isCorrect: boolean | null;  // ここを result から isCorrect に変更
  scoreChange: number | null;
  attackerName?: string;
  targetName?: string;
  onClose: () => void;
};

export function PokeResultPopup({
  isCorrect,
  scoreChange,
  attackerName,
  targetName,
  onClose,
}: PokeResultPopupProps) {
  useEffect(() => {
    if (isCorrect !== null) {
      const timer = setTimeout(onClose, 1000); // 表示時間は1秒に調整
      return () => clearTimeout(timer);
    }
  }, [isCorrect, onClose]);

  if (isCorrect === null) return null;

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
        <div style={{ marginBottom: "0.5em" }}>
          {attackerName} さんが {targetName} さんをつつきました。
        </div>
          <div>
            {isCorrect
              ? `🎯 正解！ +${scoreChange ?? "?"}点`
              : `❌ ${attackerName} は ${targetName} を外しました -${scoreChange ?? "?"}点`}
          </div>
      </div>
    </>
  );
}
