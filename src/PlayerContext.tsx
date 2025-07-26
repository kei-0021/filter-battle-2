// PlayerContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

const PlayerContext = createContext<{
  playerName: string;
  setPlayerName: (name: string) => void;
}>({ playerName: "", setPlayerName: () => {} });

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playerName, setPlayerName] = useState("");
  return (
    <PlayerContext.Provider value={{ playerName, setPlayerName }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
