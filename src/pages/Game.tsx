// Game.tsx
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { EntryField } from "../components/EntryField";
import { GameHeader } from "../components/GameHeader";
import { PokeInputPopup } from "../components/PokeInputPopup";
import { ResultPopup } from "../components/ResultPopup";
import { ScoreBoard } from "../components/ScoreBoard";
import { SubmittedCardsArea } from "../components/SubmittedCardsArea";
import filters from "../data/filters.json";
import { usePlayer } from "../PlayerContext";
import { Player, SubmittedCardData } from "../types/gameTypes";

let socket: Socket;

export function Game() {
  const { playerName } = usePlayer();

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

  useEffect(() => {
    console.log("Socket.IO接続開始...");
    socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Socket.IO connected, id:", socket.id);
      if (playerName) {
        socket.emit("join", playerName);
        console.log("joinイベント送信:", playerName);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connect_error:", err);
    });

    socket.on("newSubmission", (data: SubmittedCardData) => {
      setSubmittedCards((prev) => [...prev, data]);
    });

    socket.on("playersUpdate", (updatedPlayers: { name: string; score: number }[]) => {
      console.log("playersUpdateイベント受信:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    socket.on("themeUpdate", (newTheme: string) => {
      console.log("themeUpdateイベント受信:", newTheme);
      setTheme(newTheme);
      setSubmitted(false);
      setKeyword("");
    });

    socket.on("allSubmittedStatus", (status: boolean) => {
      console.log("allSubmittedStatusイベント受信:", status);
      setAllSubmitted(status);
    });

    socket.on("removeCard", ({ targetPlayerName }) => {
      setSubmittedCards((prev) => prev.filter((card) => card.playerName !== targetPlayerName));
    });

    return () => {
      console.log("Socket.IO切断");
      socket.disconnect();
    };
  }, [playerName]);

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

  const handleSubmit = () => {
    if (keyword.trim() && !error) {
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
        filterWords={filters[selectedCategory] || []}
      />

      <SubmittedCardsArea
        cards={submittedCards}
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
