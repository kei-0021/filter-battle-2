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
  POKING_TIME_LIMIT,
  THINKING_TIME_LIMIT
} from "../constants.js";
import filters from "../data/filters.json";
import { usePlayer } from "../PlayerContext.js";
import { useSocket } from "../SocketContext.js";
import { gameReducer, initialState } from "../state/gameReducer";
import { GamePhase, Player, SubmittedCardData } from "../types/gameTypes.js";

export function Game() {
  const { playerName } = usePlayer();
  const socket = useSocket();

  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    currentRound,
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
    allSubmitted,
  } = state;

  const allowedCategories = [
    "", "先生", "休み時間", "テスト", "友達", "部活", "放課後",
    "買い物", "習い事", "失敗", "学校", "遊び", "家", "通学",
    "親", "兄弟", "体育", "夏休み", "文化祭", "修学旅行", "バイト"
  ] as const;
  type Category = typeof allowedCategories[number];
  // 型ガード関数
  function isCategory(value: string): value is Category {
    return allowedCategories.includes(value as Category);
  }

  const [pokeNotification, setPokeNotification] = useState<{
    attackerName: string;
    targetName: string;
    isCorrect: boolean;
    scoreChange: number | null;
    guess: string; // ← ★追加
  } | null>(null);
  const [pokeDonePlayers, setPokeDonePlayers] = useState<string[]>([]);

  // 最新stateを保持するRefs
  const phaseRef = useRef(phase);
  const textRef = useRef(text);
  const errorRef = useRef(error);
  const selectedCategoryRef = useRef(selectedCategory);
  const submittedCardsRef = useRef(submittedCards);
  const playerNameRef = useRef(playerName);
  const themeRef = useRef(theme);
  const timerEndedRef = useRef(false);
  const currentRoundRef = useRef(state.currentRound);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { errorRef.current = error; }, [error]);
  useEffect(() => { submittedCardsRef.current = submittedCards; }, [submittedCards]);
  useEffect(() => { playerNameRef.current = playerName; }, [playerName]);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  const [isRuleOpen, setIsRuleOpen] = useState(false);

  const hasJoinedRef = useRef(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    currentRoundRef.current = state.currentRound;
  }, [state.currentRound]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {};
    const handleDisconnect = () => { hasJoinedRef.current = false; };

    const handleFilterAssigned = (data: { category: string }) => {
      if (isCategory(data.category)) {
        selectedCategoryRef.current = data.category; // ← ★追加！
        dispatch({ type: "SET_THEME", theme: themeRef.current, selectedCategory: data.category });
        console.log("[🫧 フィルター受信]", data.category)
      } else {
        console.warn("Unknown category received:", data.category);
      }
    };

    const handleNewSubmission = (data: SubmittedCardData) => {
      dispatch({ type: "ADD_SUBMISSION", card: data });
    };

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      dispatch({ type: "SET_PLAYERS", players: updatedPlayers });
      // dispatch({ type: "INCREMENT_TIMER_RESET" });  // タイマーリセット
    };

    const handleRoundUpdate = (data: { newTheme: string, currentRound: number }) => {
      console.log("[⭐️⭐️⭐️ ラウンド更新] ", data.currentRound)
      dispatch({
        type: "SET_THEME",
        theme: data.newTheme,
        selectedCategory: selectedCategoryRef.current,
      });
      dispatch({ type: "SET_CURRENT_ROUND", currentRound: data.currentRound });

      currentRoundRef.current = data.currentRound; // ← これを追加
      setPokeDonePlayers([]);
    };

    const handlePhaseUpdate = (newPhase: GamePhase) => {
      if (phaseRef.current === newPhase) {
        console.log("[handlePhaseUpdate] skipped same phase:", newPhase);
        return;
      }
      if (["composing", "thinking", "poking", "finished"].includes(newPhase)) {
        console.log("[✨✨ フェーズ更新]:" , newPhase);
        phaseRef.current = newPhase;
        submittingRef.current = false; // ← ここでリセットを即時行う
        dispatch({ type: "SET_PHASE", phase: newPhase });
        dispatch({ type: "INCREMENT_TIMER_RESET" });
      }
    };

    const handleAllSubmittedStatus = (allSubmitted: boolean) => {
      dispatch({ type: "SET_ALL_SUBMITTED", allSubmitted });
    };

    const handleRemoveCard = ({
      targetPlayerName,
      turnIndex,
    }: {
      targetPlayerName: string;
      turnIndex: number;
    }) => {
      dispatch({
        type: "SET_SUBMITTED_CARDS",
        submittedCards: submittedCardsRef.current.filter(
          (card) =>
            !(card.playerName === targetPlayerName && card.turnIndex === turnIndex)
        ),
      });
    };

    const handleStartPoking = () => {
      dispatch({ type: "SET_PHASE", phase: "poking" });
    };

    const handlePokeDonePlayersUpdate = (donePlayers: string[]) => {
      setPokeDonePlayers(donePlayers);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("filterAssigned", handleFilterAssigned);
    socket.on("newSubmission", handleNewSubmission);
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("roundUpdate", handleRoundUpdate);
    socket.on("phaseUpdate", handlePhaseUpdate);
    socket.on("allSubmittedStatus", handleAllSubmittedStatus);
    socket.on("removeCard", handleRemoveCard);
    socket.on("startPoking", handleStartPoking);
    socket.on("pokeDonePlayersUpdate", handlePokeDonePlayersUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("filterAssigned", handleFilterAssigned);
      socket.off("newSubmission", handleNewSubmission);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("roundUpdate", handleRoundUpdate);
      socket.off("phaseUpdate", handlePhaseUpdate);
      socket.off("allSubmittedStatus", handleAllSubmittedStatus);
      socket.off("removeCard", handleRemoveCard);
      socket.off("startPoking", handleStartPoking);
      socket.off("pokeDonePlayersUpdate", handlePokeDonePlayersUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (playerName && socket?.connected && !hasJoinedRef.current) {
      socket.emit("join", playerName);
      hasJoinedRef.current = true;
    }
  }, [playerName, socket?.connected]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [theme]);

  useEffect(() => {
    // フェーズがcomposingになったときに状態をリセット
    if (phase === "composing") {
      submittingRef.current = false;
      dispatch({ type: "SET_TEXT", text: "" }); // ← 残ってる入力を消す
      console.log("[RESET] submitting/text on composing phase start");
    }
  }, [phase]);

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

  const handleCompositionStart = () => dispatch({ type: "SET_IS_COMPOSING", isComposing: true });
  const handleCompositionEnd = () => dispatch({ type: "SET_IS_COMPOSING", isComposing: false });

  const submittingRef = useRef(false);

  const handleSubmit = useCallback(
    (allowEmpty = false) => {
      if (submittingRef.current) {
        console.log("[handleSubmit] abort: already submitting");
        return;
      }

      const currentTurnIndex = submittedCardsRef.current.filter(
        (card) => card.playerName === playerNameRef.current
      ).length;

      const hasSubmittedThisTurn = submittedCardsRef.current.some(
        (card) => card.playerName === playerNameRef.current && card.turnIndex === currentTurnIndex
      );

      if (!allowEmpty && hasSubmittedThisTurn) {
        console.log("[handleSubmit] abort: already submitted this turn");
        return;
      }
      if (!allowEmpty && !textRef.current.trim()) {
        console.log("[handleSubmit] abort: empty input");
        return;
      }
      if (errorRef.current) {
        console.log("[handleSubmit] abort: error present", errorRef.current);
        return;
      }

      submittingRef.current = true;
      const newCard: SubmittedCardData = {
        text: textRef.current,
        playerName: playerNameRef.current || "名無し",
        theme: themeRef.current,
        filterCategory: selectedCategoryRef.current || "", // ← ★修正！,
        turnIndex: currentTurnIndex,
        round: currentRoundRef.current,
      };
      console.log("[handleSubmit] emitting submit", newCard);
      socket?.emit("submit", newCard);
      dispatch({ type: "SET_TEXT", text: "" });

      setTimeout(() => {
        submittingRef.current = false;
        console.log("[handleSubmit] submit lock released");
      }, 1000);
    },
    [socket]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing && text.trim() && !error && phase === "composing") {
      handleSubmit();
    }
  };

  const handleTimerEnd = useCallback(() => {
    console.log("[handleTimerEnd] called", {
      phase: phaseRef.current,
      timerEnded: timerEndedRef.current,
      text: `"${textRef.current}"`,
    });

    if (timerEndedRef.current) {
      console.log("[handleTimerEnd] ignored: already ended");
      return;
    }
    timerEndedRef.current = true;

    // if (phaseRef.current === "composing" && !textRef.current.trim()) {
    //   console.log("[handleTimerEnd] skip submit: empty input at composing");
    //   return;
    // }

    switch (phaseRef.current) {
      case "composing":
        console.log("[強制提出]");
        handleSubmit(true);
        break;
      case "thinking":
        socket?.emit("timeUp", { phase: "thinking" });
        break;
      case "poking":
        socket?.emit("timeUp", { phase: "poking" });
        break;
    }
  }, [socket, handleSubmit]);

  useEffect(() => {
    console.log("[timerEndedRef reset]", { phase, timerResetTrigger });
    timerEndedRef.current = false;
  }, [timerResetTrigger, phase]);

  const handleNextTheme = () => {
    socket?.emit("nextTheme");
  };

  const handlePokeSubmit = (input: string) => {
    if (!pokeTargetPlayer) return;

    if (pokeDonePlayers.includes(playerNameRef.current!)) return;

    // サーバーで判定するのでクライアントで判定しない
    dispatch({ type: "SET_POKE_RESULT", result: null }); // 判定前リセット

    socket?.emit("pokeResult", {
      attackerName: playerNameRef.current,
      targetName: pokeTargetPlayer,
      guess: input.trim(), // 予想をそのまま送る
    });

    dispatch({ type: "SET_POKE_TARGET_PLAYER", playerName: null });
  };

  const handlePoke = (targetPlayerName: string) => {
    if (
      playerName &&
      (pokeDonePlayers.includes(playerName) || targetPlayerName === playerName)
    ) {
      return;
    }
    dispatch({ type: "SET_POKE_TARGET_PLAYER", playerName: targetPlayerName });
  };

  const closePopup = () => {
    dispatch({ type: "SET_POKE_RESULT", result: null });
  };

  // 追加: サーバーからのpoke結果受信イベントを処理
  useEffect(() => {
    if (!socket) return;

    const handlePokeResult = ({
      attackerName,
      targetName,
      isCorrect,
      scoreChange,
      guess, // ← ★ここも追加
    }: {
      attackerName: string;
      targetName: string;
      isCorrect: boolean;
      scoreChange: number | null;
      guess: string;
    }) => {
      setPokeNotification({ attackerName, targetName, isCorrect, scoreChange, guess });
    };

    socket.on("pokeResultNotification", handlePokeResult);

    return () => {
      socket.off("pokeResultNotification", handlePokeResult);
    };
  }, [socket, playerName]);

  const closePokeNotification = () => setPokeNotification(null);

  return (
    <>
      <GameHeader
        theme={theme}
        selectedCategory={selectedCategory}
        filterWords={selectedCategory ? filters[selectedCategory] : []}
      />
      <Timer
        key={timerResetTrigger} // ← 追加
        duration={
          phase === "composing"
            ? COMPOSING_TIME_LIMIT
            : phase === "thinking"
            ? THINKING_TIME_LIMIT
            : phase === "poking"
            ? POKING_TIME_LIMIT  // ここを修正
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
        phase={phase}
        pokeTargetPlayer={pokeTargetPlayer}
        pokeResult={pokeResult}
        onPoke={handlePoke}
        pokeDonePlayers={pokeDonePlayers}
        currentRound={currentRoundRef.current}
      />

      <ScoreBoard players={players} currentPlayerName={playerName} />

      <EntryField
        keyword={text}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        onNextTheme={handleNextTheme}
        error={error}
        submitted={phase !== "composing"}
        allSubmitted={phase === "finished"}
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
      <PokeResultPopup
        isCorrect={pokeNotification?.isCorrect ?? null}
        scoreChange={pokeNotification?.scoreChange ?? null}
        attackerName={pokeNotification?.attackerName}
        targetName={pokeNotification?.targetName}
        guess={pokeNotification?.guess} // ← ★ここを追加！
        onClose={closePokeNotification}
      />
      <RuleButton onClick={() => setIsRuleOpen(true)} />
      <RuleModal open={isRuleOpen} onClose={() => setIsRuleOpen(false)} />
    </>
  );
}
