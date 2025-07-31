import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  EntryField,
  GameHeader,
  PokeInputPopup,
  PokeResultPopup,
  RuleButton,
  RuleModal,
  ScoreBoard,
  SubmittedCardsArea,
  Timer,
} from "../components";
import {
  COMPOSING_TIME_LIMIT,
  getScoreForTurn,
  THINKING_TIME_LIMIT,
} from "../constants.js";
import filters from "../data/filters.json" with { type: "json" };
import { usePlayer } from "../PlayerContext.js";
import { useSocket } from "../SocketContext.js";
import { gameReducer, initialState } from "../state/gameReducer";
import { Player, SubmittedCardData } from "../types/gameTypes.js";

export function Game() {
  const { playerName } = usePlayer();
  const socket = useSocket();

  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    theme,
    selectedCategory,
    text,
    isComposing,
    submittedCards,
    error,
    players,
    pokeTargetPlayer,
    pokeResult,
    pokeScoreChange,
    timerResetTrigger,
    phase,
  } = state;

  // 最新stateを保持するRefs
  const phaseRef = useRef(phase);
  const textRef = useRef(text);
  const errorRef = useRef(error);
  const selectedCategoryRef = useRef(selectedCategory);
  const submittedCardsRef = useRef(submittedCards);
  const playerNameRef = useRef(playerName);
  const themeRef = useRef(theme);
  const timerEndedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    textRef.current = text;
  }, [text]);
  useEffect(() => {
    errorRef.current = error;
  }, [error]);
  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);
  useEffect(() => {
    submittedCardsRef.current = submittedCards;
  }, [submittedCards]);
  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const [isRuleOpen, setIsRuleOpen] = useState(false);

  const hasJoinedRef = useRef(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // submit中の多重送信防止フラグ
  const submittingRef = useRef(false);

  useEffect(() => {
    const categories = Object.keys(filters) as (keyof typeof filters)[];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    dispatch({
      type: "SET_THEME",
      theme: "",
      selectedCategory: randomCategory,
    });
  }, []);

  useEffect(() => {
    const handleConnect = () => {};
    const handleDisconnect = () => {
      hasJoinedRef.current = false;
    };
    const handleNewSubmission = (data: SubmittedCardData) => {
      console.log("[client] received newSubmission", data);
      dispatch({ type: "ADD_SUBMISSION", card: data });
    };
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      dispatch({ type: "SET_PLAYERS", players: updatedPlayers });
      dispatch({ type: "INCREMENT_TIMER_RESET" });
    };
    const handleThemeUpdate = (newTheme: string) => {
      dispatch({
        type: "SET_THEME",
        theme: newTheme,
        selectedCategory: selectedCategoryRef.current,
      });
      dispatch({ type: "SET_PHASE", phase: "composing" });
      dispatch({ type: "INCREMENT_TIMER_RESET" });
    };
    const handleAllSubmittedStatus = (allSubmitted: boolean) => {
      if (allSubmitted && phaseRef.current === "composing") {
        dispatch({ type: "SET_PHASE", phase: "thinking" });
        dispatch({ type: "INCREMENT_TIMER_RESET" });
      }
    };
    const handleRemoveCard = ({ targetPlayerName }: { targetPlayerName: string }) => {
      dispatch({
        type: "SET_SUBMITTED_CARDS",
        submittedCards: submittedCardsRef.current.filter(
          (card) => card.playerName !== targetPlayerName
        ),
      });
    };
    const handleStartPoking = () => {
      console.log("[client] 🛰 startPoking received");
      dispatch({ type: "SET_PHASE", phase: "poking" });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("newSubmission", handleNewSubmission);
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("themeUpdate", handleThemeUpdate);
    socket.on("allSubmittedStatus", handleAllSubmittedStatus);
    socket.on("removeCard", handleRemoveCard);
    socket.on("startPoking", handleStartPoking);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newSubmission", handleNewSubmission);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("themeUpdate", handleThemeUpdate);
      socket.off("allSubmittedStatus", handleAllSubmittedStatus);
      socket.off("removeCard", handleRemoveCard);
      socket.off("startPoking", handleStartPoking);
    };
  }, [socket]);

  useEffect(() => {
    if (playerName && socket.connected && !hasJoinedRef.current) {
      socket.emit("join", playerName);
      hasJoinedRef.current = true;
    }
  }, [playerName, socket.connected]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [theme]);

  useEffect(() => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollTo({
        top: cardsContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [submittedCards]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 200) {
      dispatch({ type: "SET_ERROR", error: "200文字以内で入力してください" });
    } else {
      dispatch({ type: "SET_ERROR", error: "" });
    }
    dispatch({ type: "SET_TEXT", text: value });
  };

  const handleCompositionStart = () =>
    dispatch({ type: "SET_IS_COMPOSING", isComposing: true });
  const handleCompositionEnd = () =>
    dispatch({ type: "SET_IS_COMPOSING", isComposing: false });

  const handleSubmit = useCallback(
    (allowEmpty = false) => {
      if (phaseRef.current !== "composing") return;
      if (submittingRef.current) return;

      const currentTurnIndex = submittedCardsRef.current.filter(
        (card) => card.playerName === playerNameRef.current
      ).length;
      const hasSubmittedThisTurn = submittedCardsRef.current.some(
        (card) =>
          card.playerName === playerNameRef.current &&
          card.turnIndex === currentTurnIndex
      );
      if (hasSubmittedThisTurn) return;
      if (!allowEmpty && !textRef.current.trim()) return;
      if (errorRef.current) return;

      submittingRef.current = true;

      const newCard: SubmittedCardData = {
        text: textRef.current,
        playerName: playerNameRef.current || "名無し",
        theme: themeRef.current,
        filterCategory: selectedCategoryRef.current,
        turnIndex: currentTurnIndex,
      };

      socket.emit("submit", newCard);
      dispatch({ type: "SET_TEXT", text: "" });

      setTimeout(() => {
        submittingRef.current = false;
      }, 1000);
    },
    [socket, dispatch]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !isComposing &&
      text.trim() &&
      !error &&
      phase === "composing"
    ) {
      handleSubmit();
    }
  };

  const handleTimerEnd = useCallback(() => {
    if (timerEndedRef.current) return; // 2回目以降は無視

    timerEndedRef.current = true;

    console.log("[client] ⏰ timer ended. current phase:", phaseRef.current);
    if (phaseRef.current === "composing") {
      handleSubmit(true);
    }
  }, [handleSubmit]);

  // タイマーリセットがかかるたびにtimerEndedRefをリセット
  useEffect(() => {
    timerEndedRef.current = false;
  }, [timerResetTrigger]);

  const handleNextTheme = () => {
    socket.emit("nextTheme");
  };

  const handlePokeSubmit = (input: string) => {
    if (!pokeTargetPlayer) return;

    const targetCard = submittedCardsRef.current
      .filter((card) => card.playerName === pokeTargetPlayer)
      .pop();
    if (!targetCard) return;

    const normalizedGuess = input.trim();
    const isCorrect = normalizedGuess === targetCard.filterCategory;

    dispatch({ type: "SET_POKE_RESULT", result: isCorrect });

    setTimeout(() => {
      dispatch({ type: "SET_POKE_TARGET_PLAYER", playerName: null });
      dispatch({ type: "SET_POKE_RESULT", result: null });
    }, 500);

    // 不正解でもサーバーに送信するようにここを修正
    socket.emit("pokeResult", {
      attackerName: playerNameRef.current,
      targetName: pokeTargetPlayer,
      isCorrect,
      turnIndex: targetCard.turnIndex,
    });

    if (isCorrect) {
      const score = getScoreForTurn(targetCard.turnIndex);
      dispatch({ type: "SET_POKE_SCORE_CHANGE", score });

      socket.emit("removeCard", { targetPlayerName: pokeTargetPlayer });
    } else {
      dispatch({ type: "SET_POKE_SCORE_CHANGE", score: null });
    }
  };

  const handlePoke = (targetPlayerName: string) => {
    dispatch({ type: "SET_POKE_TARGET_PLAYER", playerName: targetPlayerName });
  };

  const closePopup = () => {
    dispatch({ type: "SET_POKE_RESULT", result: null });
  };

  return (
    <>
      <GameHeader
        theme={theme}
        selectedCategory={selectedCategory}
        filterWords={selectedCategory ? filters[selectedCategory] : []}
      />
      <Timer
        duration={
          phase === "composing"
            ? COMPOSING_TIME_LIMIT
            : phase === "thinking"
            ? THINKING_TIME_LIMIT
            : phase === "poking"
            ? COMPOSING_TIME_LIMIT
            : 0
        }
        onTimeUp={handleTimerEnd}
        resetTrigger={timerResetTrigger}
        isActive={["composing", "thinking", "poking"].includes(phase)}
      />
      <div
        style={{
          position: "fixed",
          top: 50,
          right: 10,
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "4px 8px",
          borderRadius: 4,
          zIndex: 1100,
        }}
      >
        Phase: {phase}
      </div>

      <SubmittedCardsArea
        cards={submittedCards}
        filters={filters}
        selectedCategory={selectedCategory}
        playerName={playerName}
        phase={phase} // ← これだけでOK
        pokeTargetPlayer={pokeTargetPlayer}
        pokeResult={pokeResult}
        onPoke={handlePoke}
      />

      <ScoreBoard players={players} currentPlayerName={playerName} />

      <EntryField
        keyword={text}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        onNextTheme={handleNextTheme}
        error={error}
        submitted={phase === "thinking" || phase === "poking"}
        allSubmitted={phase === "poking" || phase === "finished"}
        inputRef={inputRef}
        inputHeight={120}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />

      <PokeInputPopup
        targetPlayerName={pokeTargetPlayer}
        onSubmit={handlePokeSubmit}
        onClose={() => dispatch({ type: "SET_POKE_TARGET_PLAYER", playerName: null })}
      />
      <PokeResultPopup result={pokeResult} scoreChange={pokeScoreChange} onClose={closePopup} />
      <RuleButton onClick={() => setIsRuleOpen(true)} />
      <RuleModal open={isRuleOpen} onClose={() => setIsRuleOpen(false)} />
    </>
  );
}
