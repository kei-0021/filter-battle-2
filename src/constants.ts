// constants.ts

/**
 * ゲーム内でのカード提出に使うタイマーの時間制限（秒）
 */
export const SUBMISSION_TIME_LIMIT = 10;

/**
 * 正しくつついたときに獲得する最大スコア
 */
export const SCORE_CORRECTLY_POKE_MAX = 4;

/**
 * 正しくつつかれたときに減点されるスコア
 */
export const SCORE_CORRECTLY_POKED = 1;

/**
 * ターンインデックスに応じたスコアを計算する関数
 */
export function getScoreForTurn(turnIndex: number): number {
  return Math.max(SCORE_CORRECTLY_POKE_MAX - turnIndex, 0);
}
