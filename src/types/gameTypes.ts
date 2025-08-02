// src/types/gameTypes.ts

export type GamePhase = "waiting" | "composing" | "thinking" | "poking" | "finished";

export type SubmittedCardData = {
  text: string;
  playerName: string;
  theme: string;
  filterCategory: string; // 変更: keyof typeof filtersからstringに変更
  turnIndex: number;
  round: number;
  score: number; // ← これを追加！
};

export type Player = {
  name: string;
  score: number; // 追加
  filterCategory: string; // 追加
};