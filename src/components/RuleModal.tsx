import { Book } from "lucide-react";

type RuleModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RuleModal({ open, onClose }: RuleModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose} // 背景クリックで閉じる
    >
      <div
        onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じないように
        style={{
          backgroundColor: "#1a1a1a",
          color: "white",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 15px rgba(255,255,255,0.2)",
          fontSize: "1rem",
          lineHeight: 1.5,
        }}
      >
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>📖 ゲームルール：Filter Battle 2</h2>

        <section style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>🎯 目的</h3>
          <p>あなたに与えられた「フィルター」に従ってカードを出し、他のプレイヤーのフィルターを見破ろう！</p>
        </section>

        <section style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>🧠 基本ルール</h3>
          <ul style={{ paddingLeft: "1.2rem", listStyleType: "disc", marginBottom: 0 }}>
            <li>各プレイヤーには「<strong>異なるフィルター</strong>」と、<strong>キーワード群</strong>が秘密裏に配られます。</li>
            <li>毎ターン、全員共通のお題「〇〇あるある」が提示されます。</li>
            <li>
              プレイヤーはお題に沿った「あるあるカード」を投稿します。
              <ul style={{ paddingLeft: "1rem", listStyleType: "circle" }}>
                <li>※ただし、自分のフィルターに沿った<strong>キーワードを1つ以上含める必要</strong>があります。</li>
              </ul>
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>👀 推理とアクション</h3>
          <ul style={{ paddingLeft: "1.2rem", listStyleType: "disc", marginBottom: 0 }}>
            <li>他のプレイヤーのカードを見て、<strong>どんなフィルターかを推理</strong>しましょう。</li>
            <li>
              「これがキーワードだ！」と思ったら、<strong>いつでも「つつく」ボタンで指摘</strong>できます。
              <ul style={{ paddingLeft: "1rem", listStyleType: "circle" }}>
                <li>成功：相手のポイントを奪える！</li>
                <li>失敗：あなたのポイントが減少…</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>💡 得点ルール</h3>
          <ul style={{ paddingLeft: "1.2rem", listStyleType: "disc", marginBottom: 0 }}>
            <li>カードを多く投稿するほどポイントが加算されます。</li>
            <li><strong>「つつく」で見破られると、そのターンのカードは無効</strong>になるので注意！</li>
            <li><strong>最も多くポイントを集めた人が勝利</strong>！</li>
          </ul>
        </section>

        <button
          onClick={onClose}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#ff5f5f",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

export function RuleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        backgroundColor: "transparent",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.3em",
        zIndex: 2000, // これを追加
      }}
      aria-label="ルールを開く"
      title="ゲームルールを開く"
    >
      <Book size={18} />
      ルール
    </button>
  );
}
