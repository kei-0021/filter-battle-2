// src/state/gameReducer.ts
import { FilterCategory, GamePhase, Player, SubmittedCardData } from "../types/gameTypes";

export type GameState = {
  currentRound: number;
  theme: string;
  selectedCategory: FilterCategory | "";
  keywords: string[];
  text: string;
  isComposing: boolean;
  submittedCards: SubmittedCardData[];
  error: string;
  players: Player[];
  pokeTargetPlayer: string | null;
  pokeResult: boolean | null;
  pokeScoreChange: number | null;
  timerResetTrigger: number;
  phase: GamePhase;
  allSubmitted: boolean;
};

export type GameAction =
  | { type: "SET_CURRENT_ROUND"; currentRound: number }
  | { type: "SET_THEME"; theme: string; selectedCategory: FilterCategory | ""; keywords?: string[] }
  | { type: "SET_CATEGORY_AND_KEYWORDS"; selectedCategory: FilterCategory | ""; keywords: string[] }
  | { type: "SET_TEXT"; text: string }
  | { type: "ADD_SUBMISSION"; card: SubmittedCardData }
  | { type: "SET_POKE_RESULT"; result: boolean | null }
  | { type: "RESET_POKE" }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_PLAYERS"; players: Player[] }
  | { type: "INCREMENT_TIMER_RESET" }
  | { type: "SET_POKE_TARGET_PLAYER"; playerName: string | null }
  | { type: "SET_POKE_SCORE_CHANGE"; score: number | null }
  | { type: "SET_IS_COMPOSING"; isComposing: boolean }
  | { type: "SET_SUBMITTED_CARDS"; submittedCards: SubmittedCardData[] }
  | { type: "SET_PHASE"; phase: GamePhase }
  | { type: "SET_ALL_SUBMITTED"; allSubmitted: boolean };

export const initialState: GameState = {
  currentRound: 0,
  theme: "",
  selectedCategory: "",
  keywords: [],
  text: "",
  isComposing: false,
  submittedCards: [],
  error: "",
  players: [],
  pokeTargetPlayer: null,
  pokeResult: null,
  pokeScoreChange: null,
  timerResetTrigger: 0,
  phase: "composing",
  allSubmitted: false,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_CURRENT_ROUND":
      return { ...state, currentRound: action.currentRound };

    case "SET_THEME":
      return {
        ...state,
        theme: action.theme,
        selectedCategory: action.selectedCategory,
        keywords: action.keywords ?? state.keywords,
        text: "",
        pokeTargetPlayer: null,
        pokeResult: null,
        pokeScoreChange: null,
      };

    case "SET_CATEGORY_AND_KEYWORDS":
      return {
        ...state,
        selectedCategory: action.selectedCategory,
        keywords: action.keywords,
      };

    case "SET_TEXT":
      return { ...state, text: action.text };

    case "ADD_SUBMISSION":
      return { ...state, submittedCards: [...state.submittedCards, action.card] };

    case "SET_POKE_RESULT":
      return { ...state, pokeResult: action.result };

    case "RESET_POKE":
      return { ...state, pokeTargetPlayer: null, pokeResult: null, pokeScoreChange: null };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_PLAYERS":
      return { ...state, players: action.players };

    case "INCREMENT_TIMER_RESET":
      return { ...state, timerResetTrigger: state.timerResetTrigger + 1 };

    case "SET_POKE_TARGET_PLAYER":
      return { ...state, pokeTargetPlayer: action.playerName };

    case "SET_POKE_SCORE_CHANGE":
      return { ...state, pokeScoreChange: action.score };

    case "SET_IS_COMPOSING":
      return { ...state, isComposing: action.isComposing };

    case "SET_SUBMITTED_CARDS":
      return { ...state, submittedCards: action.submittedCards };

    case "SET_PHASE":
      return { ...state, phase: action.phase };

    case "SET_ALL_SUBMITTED":
      return { ...state, allSubmitted: action.allSubmitted };

    default:
      return state;
  }
}
