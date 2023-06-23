import React, { useEffect } from "react";
import "./App.css";
import { Button } from "../shared/ui/Button";
import { useAppStore } from "../shared";
import { MetamaskButton, StartGameButton } from "../features";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CountdownTimer } from "../features";
import { GuessForm } from "../widgets";

function App() {
  const [
    init,
    web3,
    wallet,
    isContractOwner,
    endTimerTime,
    endTimerRevealTime,
    isSubmissionPhase,
    isRevealPhase,
  ] = useAppStore((state) => [
    state.init,
    state.web3,
    state.wallet,
    state.isContractOwner,
    state.endTimerTime,
    state.endTimerRevealTime,
    state.isSubmissionPhase,
    state.isRevealPhase,
  ]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <header className="flex justify-end items-center px-6">
        <MetamaskButton />
      </header>
      <body className="container">
        <h1>Guessing game</h1>
        <div className="rules">
          <p>Long time ago in the Ethereum universe...</p>
          <p>
            Only the master jedi can start the game, but every padavan can play.
            To join the quest, connect your wallet with Metamask. If the game
            has started, enter your guess and your salt, a mysterious number
            that makes your guess secure.
          </p>
          <p>
            Every player has one hour to submit the guess, and after that, one
            hour to reveal it. The force will be strong with the one who guesses
            right. The winner gets the prize, minus the master jedi's fee. May
            the force be with you.
          </p>
        </div>

        {isContractOwner && <StartGameButton />}
        {isSubmissionPhase() && (
          <div id="submissionTitle">SUBMISSION PHASE IS OPEN</div>
        )}
        {isRevealPhase() && <div id="revealTitle">REVEAL PHASE IS OPEN</div>}
        {(isSubmissionPhase() || isRevealPhase()) && (
          <CountdownTimer
            endTime={isSubmissionPhase() ? endTimerTime : endTimerRevealTime}
          />
        )}

        {wallet?.accounts.length &&
          !isContractOwner &&
          (isSubmissionPhase() || isRevealPhase()) && <GuessForm />}

        {/*<button id="calculateWinningGuessButton" disabled>*/}
        {/*  Calculate winning guess*/}
        {/*</button>*/}
        {/*<button id="selectWinnerButton" disabled>*/}
        {/*  Select winner*/}
        {/*</button>*/}
      </body>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
