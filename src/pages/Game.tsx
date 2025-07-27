import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { EntryField } from "../components/EntryField.js";
import { GameHeader } from "../components/GameHeader.js";
import { PokeInputPopup } from "../components/PokeInputPopup.js";
import { ResultPopup } from "../components/ResultPopup.js";
import { ScoreBoard } from "../components/ScoreBoard.js";
import { SubmittedCardsArea } from "../components/SubmittedCardsArea.js";
import { Timer } from "../components/Timer.js";
import { SUBMISSION_TIME_LIMIT } from "../constants.js";
import filters from "../data/filters.json" with { type: "json" };
import { usePlayer } from "../PlayerContext.js";
import { useSocket } from "../SocketContext.js";
import { Player, SubmittedCardData } from "../types/gameTypes.js";

export function Game() {
  const { playerName } = usePlayer();
  const socket = useSocket();

  const [theme, setTheme] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof filters | "">("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCards, setSubmittedCards] = useState<SubmittedCardData[]>([]);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [allSubmitted, setAllSubmitted] = useState(false);

  const [pokeTargetPlayer, setPokeTargetPlayer] = useState<string | null>(null);
  const [pokeResult, setPokeResult] = useState<boolean | null>(null);

  const [playerCount, setPlayerCount] = useState(0);
  const [timerResetTrigger, setTimerResetTrigger] = useState(0);
  const hasJoinedRef = useRef(false); // ★追加: 既にjoinイベントを送ったかを管理するref

  const HEADER_HEIGHT = 150;
  const INPUT_HEIGHT = 120;

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cardsToShow = submittedCards;

  useEffect(() => {
    const categories = Object.keys(filters) as (keyof typeof filters)[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setSelectedCategory(randomCategory);
    setKeywords(filters[randomCategory]);
  }, []);

  // Socket.IOイベントリスナー設定
  useEffect(() => {
    console.log("Socket.IO接続開始...");

    const handleConnect = () => {
      console.log("Socket.IO connected, id:", socket.id);
      // ここではjoinは送らず、後続のuseEffectでplayerNameが確定した時に送る
    };

    const handleDisconnect = (reason: string) => {
      console.log("Socket.IO disconnected:", reason);
      hasJoinedRef.current = false; // ★追加: 切断されたらフラグをリセット
    };

    const handleConnectError = (err: Error) => {
      console.error("Socket.IO connect_error:", err);
    };

    const handleNewSubmission = (data: SubmittedCardData) => {
      setSubmittedCards((prev) => [...prev, data]);
    };

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      console.log("playersUpdateイベント受信:", updatedPlayers);
      setPlayers(updatedPlayers);
      // プレイヤー数が変わった時だけでなく、ゲーム開始（初回テーマ受信）時もリセットを考慮する
      if (updatedPlayers.length !== playerCount) { // ★修正: プレイヤー数が変わったらリセット
        setTimerResetTrigger((prev) => prev + 1);
      }
      setPlayerCount(updatedPlayers.length);
    };

    const handleThemeUpdate = (newTheme: string) => {
      console.log("themeUpdateイベント受信:", newTheme);
      setTheme(newTheme);
      setSubmitted(false);
      setKeyword("");
      setTimerResetTrigger((prev) => prev + 1); // ★追加: 新しいテーマが来た時もタイマーをリセット
    };

    const handleAllSubmittedStatus = (status: boolean) => {
      console.log("allSubmittedStatusイベント受信:", status);
      setAllSubmitted(status);
    };

    const handleRemoveCard = ({ targetPlayerName }: { targetPlayerName: string }) => {
      setSubmittedCards((prev) => prev.filter((card) => card.playerName !== targetPlayerName));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("newSubmission", handleNewSubmission);
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("themeUpdate", handleThemeUpdate);
    socket.on("allSubmittedStatus", handleAllSubmittedStatus);
    socket.on("removeCard", handleRemoveCard);

    return () => {
      console.log("Gameコンポーネント: Socket.IOイベントリスナーを解除");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("newSubmission", handleNewSubmission);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("themeUpdate", handleThemeUpdate);
      socket.off("allSubmittedStatus", handleAllSubmittedStatus);
      socket.off("removeCard", handleRemoveCard);
    };
  }, [socket, playerCount]);

  // playerNameが設定され、ソケットが接続されており、かつまだjoinイベントを送っていない場合のみjoinイベントを送信
  useEffect(() => {
    if (playerName && socket.connected && !hasJoinedRef.current) { // ★修正: hasJoinedRef.currentを追加
      console.log("joinイベント送信: PlayerNameが設定されたため:", playerName);
      socket.emit("join", playerName);
      hasJoinedRef.current = true; // ★追加: joinイベント送信後にフラグを設定
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
      setError("200文字以内で入力してください");
    } else {
      setError("");
    }
    setKeyword(value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing && keyword.trim() && !error && !submitted) {
      handleSubmit();
    }
  };

  const handleSubmit = (allowEmpty = false) => {
    if ((!allowEmpty && !keyword.trim()) || error) {
      return;
    }

    const newCard = {
      text: keyword,
      playerName: playerName || "名無し",
      theme,
      filterCategory: selectedCategory,
    };
    console.log("submitイベント送信:", newCard);
    socket.emit("submit", newCard);
    setSubmitted(true);
    setKeyword("");
  };

  const handleTimeUp = () => {
    if (!submitted) {
      handleSubmit(true);
    }
  };

  const handleNextTheme = () => {
    socket.emit("nextTheme");
  };

  const handlePokeSubmit = (input: string) => {
    if (!pokeTargetPlayer) return;

    const targetCard = submittedCards.filter((card) => card.playerName === pokeTargetPlayer).pop();
    if (!targetCard) return;

    const normalizedGuess = input.trim();
    const isCorrect = normalizedGuess === targetCard.filterCategory;

    console.log("つつき判定", {
      input,
      targetPlayer: pokeTargetPlayer,
      targetFilter: targetCard.filterCategory,
      isCorrect,
    });

    setPokeResult(isCorrect);

    setTimeout(() => setPokeTargetPlayer(null), 500);

    if (isCorrect) {
      socket.emit("pokeResult", {
        attackerName: playerName,
        targetName: pokeTargetPlayer,
        isCorrect,
      });

      socket.emit("removeCard", {
        targetPlayerName: pokeTargetPlayer,
      });
    }
  };

  const handlePoke = (targetPlayerName: string) => {
    setPokeTargetPlayer(targetPlayerName);
  };

  const closePopup = () => setPokeResult(null);

  return (
    <>
      <GameHeader
        theme={theme}
        selectedCategory={selectedCategory}
        filterWords={selectedCategory ? filters[selectedCategory] : []}
      />

      <Timer
        duration={SUBMISSION_TIME_LIMIT}
        onTimeUp={handleTimeUp}
        resetTrigger={timerResetTrigger}
        isActive={!submitted && !allSubmitted}
      />

      <SubmittedCardsArea
        cards={cardsToShow}
        filters={filters}
        selectedCategory={selectedCategory}
        playerName={playerName}
        pokeTargetPlayer={pokeTargetPlayer}
        pokeResult={pokeResult}
        onPoke={handlePoke}
      />

      <ScoreBoard players={players} currentPlayerName={playerName} />

      <EntryField
        keyword={keyword}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        onNextTheme={handleNextTheme}
        error={error}
        submitted={submitted}
        allSubmitted={allSubmitted}
        inputRef={inputRef}
        inputHeight={INPUT_HEIGHT}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />

      <PokeInputPopup
        targetPlayerName={pokeTargetPlayer}
        onSubmit={handlePokeSubmit}
        onClose={() => setPokeTargetPlayer(null)}
      />

      <ResultPopup result={pokeResult} onClose={closePopup} />
    </>
  );
}