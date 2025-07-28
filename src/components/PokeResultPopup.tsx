// PokeResult.tsx
import { useEffect } from "react";

type PokePokeResultPopupProps = {
  result: boolean | null;
  scoreChange: number | null;
  onClose: () => void;
};

export function PokeResultPopup({ result, scoreChange, onClose }: PokePokeResultPopupProps) {
  useEffect(() => {
    if (result !== null) {
      const timer = setTimeout(onClose, 500); // 0.5秒後に自動で閉じる
      return () => clearTimeout(timer); // クリーンアップ
    }
  }, [result, onClose]);

  if (result === null) return null;

  return (
    <>
      {/* 背景の半透明オーバーレイ */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        }}
        onClick={onClose} // 背景クリックでも閉じる
      />
      {/* 中央のポップアップ */}
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
          fontSize: "1.5rem",
          fontWeight: "bold",
          zIndex: 1001,
          userSelect: "none",
          textAlign: "center",
          minWidth: "200px",
        }}
      >
        {result ? `🎯 正解！ +${scoreChange ?? "?"}点` : "❌ ハズレ"}
      </div>
    </>
  );
}
