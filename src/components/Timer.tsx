import { useEffect, useRef, useState } from "react";

type TimerProps = {
  duration: number;
  onTimeUp: () => void;
  resetTrigger: any;
  isActive: boolean;
};

export function Timer({ duration, onTimeUp, resetTrigger, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const hasCalledTimeUpRef = useRef(false);

  // resetTrigger または isActive 変化時にリセット
  useEffect(() => {
    if (!isActive) return;
    console.log("[🕑 タイマーセット] %d s" , duration)
    hasCalledTimeUpRef.current = false;
    setTimeLeft(duration);
  }, [duration, resetTrigger, isActive]);

  // カウントダウン処理
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, isActive]);

  // タイムアップ呼び出し（副作用）
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0 && !hasCalledTimeUpRef.current) {
      hasCalledTimeUpRef.current = true;
      onTimeUp();
    }
  }, [timeLeft, isActive, onTimeUp]);

  const percent = timeLeft / duration;
  const color =
    percent > 0.5 ? "#4caf50" : percent > 0.2 ? "#ff9800" : "#ff4d4d";

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
