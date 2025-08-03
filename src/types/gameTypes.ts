// src/types/gameTypes.ts
import filters from "../data/filters.json";

export type GamePhase = "waiting" | "composing" | "thinking" | "poking" | "finished";

export type FilterCategory = keyof typeof filters;

export type Player = {
  name: string;
  score: number; // 追加
  filterCategory: string; // 追加
};

export type SubmittedCardData = {
  text: string;
  playerName: string;
  theme: string;
  filterCategory: FilterCategory;
  turnIndex: number;
  round: number;
  score: number; // ← これを追加！
};