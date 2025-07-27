import { useEffect, useState } from "react";

type TimerProps = {
  duration: number;            // 秒数
  onTimeUp: () => void;        // タイムアップ時のコールバック
  resetTrigger: any;           // リセットのトリガー（親から渡す依存値）
  isActive: boolean;           // タイマー動作フラグ（提出済みならfalseなど）
};

export function Timer({ duration, onTimeUp, resetTrigger, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, resetTrigger]);

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, isActive, onTimeUp]);

  // 色を割合で決める（半分以上緑、2割超橙、それ以下赤）
  const percent = timeLeft / duration;
  const color =
    percent > 0.5 ? "#4caf50" :
    percent > 0.2 ? "#ff9800" :
    "#ff4d4d";

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        color: "white",
        fontWeight: "bold",
        zIndex: 1000,
        userSelect: "none",
        fontSize: "1.2rem",
      }}
    >
      残り時間:{" "}
      <span style={{ fontSize: "2rem", color, fontWeight: "900" }}>
        {timeLeft}秒
      </span>
    </div>
  );
}
