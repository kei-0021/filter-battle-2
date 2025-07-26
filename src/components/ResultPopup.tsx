type ResultPopupProps = {
  result: boolean | null;
  onClose: () => void;
};

export function ResultPopup({ result, onClose }: ResultPopupProps) {
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
        onClick={onClose} // 背景クリックで閉じる
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
        <button
          onClick={onClose}
          aria-label="閉じる"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "1.2rem",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          ×
        </button>
        {result ? "🎯 正解！ +3点" : "❌ ハズレ"}
      </div>
    </>
  );
}
