// constants.ts

/**
 * ゲーム内でのカード提出に使うタイマーの時間制限（秒）
 */
export const COMPOSING_TIME_LIMIT = 5;

/**
 * つつくために考えるための時間 (秒)
 */
export const THINKING_TIME_LIMIT = 10;

/**
 * poke（つつき）フェーズの時間制限（秒）
 */
export const POKING_TIME_LIMIT = 15;

/**
 * 正しくつついたときに獲得する最大スコア
 */
export const SCORE_CORRECTLY_POKE_MAX = 4;

/**
 * つつきに失敗したときに減点されるスコア
 */
export const SCORE_FAILED_POKE = 1;

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
