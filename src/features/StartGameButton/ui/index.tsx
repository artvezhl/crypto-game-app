import { Button, useAppStore } from "../../../shared";
import React from "react";

export const StartGameButton = () => {
  const [connect, disconnect, wallet, startGame, isContractOwner] = useAppStore(
    (state) => [
      state.connect,
      state.disconnect,
      state.wallet,
      state.startGame,
      state.isContractOwner,
    ]
  );

  return (
    <Button
      disabled={!isContractOwner}
      // loading={!!wallet?.loading}
      onClick={startGame}
    >
      Start Game
    </Button>
  );
};
