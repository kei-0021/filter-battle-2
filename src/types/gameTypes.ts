// src/types/gameTypes.ts
export type SubmittedCardData = {
  text: string;
  playerName: string;
  theme: string;
  filterCategory: string; // 変更: keyof typeof filtersからstringに変更
  turnIndex: number;
};

export type Player = {
  name: string;
  score: number; // 追加
};
