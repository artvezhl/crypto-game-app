import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <button id="connectButton"><i className="fas fa-wallet"></i> Connect Metamask</button>
      </header>
      <body className="container">
      <pre>
     #####                                                  #####
    #     # #    # ######  ####   ####  # #    #  ####     #     #   ##   #    # ######
    #       #    # #      #      #      # ##   # #    #    #        #  #  ##  ## #
    #  #### #    # #####   ####   ####  # # #  # #         #  #### #    # # ## # #####
    #     # #    # #           #      # # #  # # #  ###    #     # ###### #    # #
    #     # #    # #      #    # #    # # #   ## #    #    #     # #    # #    # #
     #####   ####  ######  ####   ####  # #    #  ####      #####  #    # #    # ######
    </pre>

      <div className="rules">
        <p>Long time ago in the Ethereum universe...</p>
        <p>Only the master jedi can start the game, but every padavan can play. To join the quest, connect your wallet
          with Metamask. If the game has started, enter your guess and your salt, a mysterious number that makes your
          guess secure.</p>
        <p>Every player has one hour to submit the guess, and after that, one hour to reveal it. The force will be
          strong with the one who guesses right. The winner gets the prize, minus the master jedi's fee. May the force
          be with you.</p>
      </div>


      <!--  startGameButton is available only for the contract's owner  -->
      <button id="startGameButton" style="display:none;">Start Game</button>
      <div id="submissionTitle" style="display: none;">SUBMISSION PHASE IS OPEN</div>
      <div id="revealTitle" style="display: none;">REVEAL PHASE IS OPEN</div>
      <div id="countdownTimer" style="display:none;"></div>
      <div className="input-container">
        <input id="guessInput" type="password" placeholder="Your guess" disabled style="display: none;" />
          <i className="fas fa-eye" id="toggleGuessVisibility" style="display: none;"></i>
          <p id="guessError" style="color:red; display:none;">This input is too large</p>
      </div>
      <div className="input-container">
        <input id="saltInput" type="password" placeholder="Your salt" disabled style="display: none;">
          <i className="fas fa-eye" id="toggleSaltVisibility" style="display: none;"></i>
      </div>
      <button id="enterGuessButton" disabled style="display: none;">Submit your guess</button>

      <!--  startGameButton is available only for the contract's owner  -->
      <button id="calculateWinningGuessButton" disabled style="display: none;">Calculate winning guess</button>
      <button id="selectWinnerButton" disabled style="display: none;">Select winner</button>

      </body>
    </div>
  );
}

export default App;
