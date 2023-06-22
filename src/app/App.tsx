import React, { useEffect } from "react";
import "./App.css";
import { Button } from "../shared/ui/Button";
import { useAppStore } from "../shared";
import { MetamaskButton } from "../features";

function App() {
  const [init, web3] = useAppStore((state) => [state.init, state.web3]);

  useEffect(() => {
    init();
  }, [init]);
  // useEffect(() => {
  //   const fetchAccounts = async () => {
  //     if (web3) {
  //       // Создаем экземпляр Web3 с использованием провайдера от MetaMask
  //       try {
  //         // Запрашиваем доступ к аккаунтам пользователя
  //         await window.ethereum.enable();
  //         // Получаем список аккаунтов
  //         const accounts = await web3.eth.getAccounts();
  //         console.log("accounts", accounts);
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     }
  //   };
  //
  //   fetchAccounts();
  // }, [web3]);

  return (
    <div>
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

        <Button>Start Game</Button>
        <div id="submissionTitle">SUBMISSION PHASE IS OPEN</div>
        <div id="revealTitle">REVEAL PHASE IS OPEN</div>
        <div id="countdownTimer"></div>
        <div className="input-container">
          <input
            id="guessInput"
            type="password"
            placeholder="Your guess"
            disabled
          />
          <i className="fas fa-eye" id="toggleGuessVisibility"></i>
          <p id="guessError">This input is too large</p>
        </div>
        <div className="input-container">
          <input
            id="saltInput"
            type="password"
            placeholder="Your salt"
            disabled
          />
          <i className="fas fa-eye" id="toggleSaltVisibility"></i>
        </div>
        <button id="enterGuessButton" disabled>
          Submit your guess
        </button>

        <button id="calculateWinningGuessButton" disabled>
          Calculate winning guess
        </button>
        <button id="selectWinnerButton" disabled>
          Select winner
        </button>
      </body>
    </div>
  );
}

export default App;
