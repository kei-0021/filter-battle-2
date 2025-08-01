import React, { useEffect, useRef } from "react";
import { SubmittedCard } from "../components/SubmittedCard";
import filters from "../data/filters.json";
import { SubmittedCardData } from "../types/gameTypes";

type SubmittedCardsAreaProps = {
  cards: SubmittedCardData[];
  filters: typeof filters;
  selectedCategory: keyof typeof filters | "";
  playerName: string;
  pokeTargetPlayer: string | null;
  pokeResult: boolean | null;
  onPoke: (targetPlayerName: string) => void;
};

export const SubmittedCardsArea: React.FC<SubmittedCardsAreaProps> = ({
  cards,
  filters,
  selectedCategory,
  playerName,
  pokeTargetPlayer,
  pokeResult,
  onPoke,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // 少し遅らせる
    const timer = setTimeout(() => {
      containerRef.current!.scrollTo({
        top: containerRef.current!.scrollHeight,
        behavior: "smooth",
      });
    }, 100); // 100ms遅延

    return () => clearTimeout(timer);
  }, [cards]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        bottom: 120,
        left: 0,
        right: "200px",
        overflowY: cards.length > 0 ? "auto" : "hidden",
        backgroundColor: "#1e1e1e",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        paddingTop: 150 * 1.4,
        boxSizing: "border-box",
        zIndex: 50,
      }}
    >
      {cards.map((card, index) => {
        const isLatestCardForPlayer =
          cards.filter((c) => c.playerName === card.playerName).at(-1) === card;

        const isPopped = pokeResult === true && pokeTargetPlayer === card.playerName;

        return (
          <div key={`${card.playerName}-${index}`} style={{ marginBottom: "1rem" }}>
            <SubmittedCard
              text={card.text}
              theme={card.theme}
              playerName={card.playerName}
              filterKeywords={filters[selectedCategory] || []}
              showPokeButton={card.playerName !== playerName && isLatestCardForPlayer}
              useBubbleStyle={true}
              pokeResult={isPopped ? true : null}
              onPoke={() => onPoke(card.playerName)}
            />
          </div>
        );
      })}
    </div>
  );
};
