import { create } from "zustand";
import Web3, { Contract } from "web3";
import ABI from "../data/GuessTheNumberGame.json";
import { toast } from "react-toastify";

export type TWallet = {
  connected: boolean;
  loading: boolean;
  accounts: string[];
};

type AppStoreState = {
  web3: Web3 | null;
  contractInstance: Contract<typeof ABI> | null;
  wallet: TWallet | null;
  isContractOwner: boolean;
  endTimerTime?: number;
  endTimerRevealTime?: number;
  submissionPeriod: number;
  revealingPeriod: number;
  countdownTimer: number;
  isGameStarted: boolean;
  isGuessesSubmitted: boolean;
  isSaltSubmitted: boolean;
  isWinningGuessCalculated: boolean;
};

type AppStoreActions = {
  isPhase: () => boolean;
  isSubmissionPhase: () => boolean;
  isRevealPhase: () => boolean;
  isCalculateWinningPhase: () => boolean;
  init: () => Promise<void>;
  initEventSubscription: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  startGame: () => void;
  setCountdownTimer: (endTime: number) => void;
  enterGuess: (values: { guess: number; salt: number }) => Promise<void>;
  revealSaltAndGuess: (values: {
    guess: number;
    salt: number;
  }) => Promise<void>;
  calculateWinningGuess: () => Promise<void>;
  selectWinner: () => Promise<void>;
};
type AppStore = AppStoreState & AppStoreActions;

export const useAppStore = create<AppStore>()((set, get) => ({
  web3: null,
  contractInstance: null,
  wallet: null,
  isContractOwner: false,
  endTimerTime: undefined,
  endTimerRevealTime: undefined,
  submissionPeriod: 0,
  revealingPeriod: 0,
  countdownTimer: 0,
  isGameStarted: false,
  isGuessesSubmitted: false,
  isSaltSubmitted: false,
  isWinningGuessCalculated: false,
  isPhase: () => get().isSubmissionPhase() || get().isRevealPhase(),
  isSubmissionPhase: () => {
    const submission = get().endTimerTime;
    if (!submission) return false;

    return (
      submission - new Date().getTime() < 60000 &&
      submission - new Date().getTime() > 0
    );
  },
  isRevealPhase: () => {
    const reveal = get().endTimerRevealTime;
    if (!reveal) return false;

    return (
      reveal - new Date().getTime() > 0 && reveal - new Date().getTime() < 60000
    );
  },
  isCalculateWinningPhase: () => !get().isPhase(),
  period: null,
  init: async () => {
    if (window.ethereum) {
      // create WEB3 instance
      const web3 = new Web3(window.ethereum);
      set({ web3 });
      // create contract instance
      const contractInstance = new web3.eth.Contract(
        ABI,
        process.env.REACT_APP_CONTRACT_ADDRESS
      );
      if (contractInstance) set({ contractInstance });

      const pastStartedEvents = await contractInstance.getPastEvents(
        // @ts-ignore
        "GameStarted",
        {
          fromBlock: "earliest",
          toBlock: "latest",
        }
      );
      if (localStorage.getItem("wallet")) {
        const contractOwner: string | undefined = await get()
          .contractInstance?.methods.owner()
          .call();
        const wallet = JSON.parse(localStorage.getItem("wallet") as string);
        set((state) => ({
          wallet: {
            ...wallet,
            loading: false,
          },
          isContractOwner: wallet.accounts[0] === contractOwner,
        }));
      }

      const submissionPeriod = await get()
        .contractInstance?.methods.submissionPeriod()
        .call();
      const revealPeriod = await get()
        .contractInstance?.methods.revealPeriod()
        .call();
      if (
        typeof submissionPeriod === "number" &&
        typeof revealPeriod === "number"
      )
        set({
          submissionPeriod: Number(submissionPeriod) * 1000,
          revealingPeriod: Number(revealPeriod) * 1000,
        });
      if (pastStartedEvents.length) {
        const lastEvent: any = pastStartedEvents[pastStartedEvents.length - 1];
        const timestamp = lastEvent?.returnValues.timestamp;
        const endTimerTime =
          (Number(timestamp) + Number(submissionPeriod)) * 1000;
        const endTimerRevealTime =
          (Number(timestamp) +
            Number(submissionPeriod) +
            Number(revealPeriod)) *
          1000;
        set({ endTimerTime, endTimerRevealTime });
      }
      // await get().initEventSubscription();
    }
  },
  initEventSubscription: async () => {
    const contract = get().contractInstance;

    const gameStartedEventSubscription = contract?.events.GameStarted();
    const guessSubmittedEventSubscription = contract?.events.GuessSubmitted();
    const winningGuessCalculatedEventSubscription =
      contract?.events.WinningGuessCalculated();
    const submissionPeriod = get().submissionPeriod;

    const allGuessesSubmittedSubscription =
      await contract?.events.AllGuessesSubmitted();
    const allSaltSubmittedSubscription =
      await contract?.events.AllGuessesSubmitted();

    allGuessesSubmittedSubscription?.on("data", async (eventLog) => {
      toast.success("All guesses are submitted");

      set({ isGuessesSubmitted: true });

      await allGuessesSubmittedSubscription.unsubscribe();
    });
    allGuessesSubmittedSubscription?.on("error", (error) => {
      throw error;
    });

    allSaltSubmittedSubscription?.on("data", async (eventLog) => {
      toast.success("All salt is submitted");

      set({ isSaltSubmitted: true });

      await allSaltSubmittedSubscription.unsubscribe();
    });
    allSaltSubmittedSubscription?.on("error", (error) => {
      throw error;
    });

    // if (gameStartedEventSubscription) {
    //   gameStartedEventSubscription.on("data", async (event) => {
    //     toast.success("The game is started");
    //     const timestamp = event.returnValues.timestamp;
    //     const endTimerTime =
    //       (Number(timestamp) + Number(submissionPeriod)) * 1000;
    //     set({ endTimerTime });
    //
    //     await gameStartedEventSubscription.unsubscribe();
    //   });
    //   gameStartedEventSubscription.on("error", (error) => {
    //     toast.error(error.message);
    //     console.error("Subscription error:", error);
    //   });
    // }
    //
    // if (winningGuessCalculatedEventSubscription) {
    //   winningGuessCalculatedEventSubscription.on("data", async (event) => {
    //     console.log("EVENT WINNING VALUES", event);
    //     toast.success("The winning guess is calculated");
    //     await winningGuessCalculatedEventSubscription.unsubscribe();
    //   });
    //   winningGuessCalculatedEventSubscription.on("error", (error) => {
    //     toast.error(error.message);
    //     console.error("Subscription error:", error);
    //   });
    // }
    //
    // if (guessSubmittedEventSubscription) {
    //   guessSubmittedEventSubscription.on("data", async (event) => {
    //     await guessSubmittedEventSubscription.unsubscribe();
    //     set({ isGuessesSubmitted: true });
    //   });
    //   guessSubmittedEventSubscription.on("error", (error) => {
    //     console.error("guessSubmittedEventSubscription error:", error);
    //   });
    // }
  },
  connect: async () => {
    const web3 = get().web3;
    set({
      wallet: {
        connected: false,
        loading: true,
        accounts: [],
      },
    });
    if (web3) {
      try {
        await window.ethereum.enable();
        // get user metamask accounts
        const accounts = await web3.eth.getAccounts();
        //
        const contract = get().contractInstance;
        if (contract) {
          try {
            const contractOwner: string | undefined = await get()
              .contractInstance?.methods.owner()
              .call();
            if (contractOwner)
              set({ isContractOwner: accounts[0] === contractOwner });
          } catch (error) {
            throw error;
          }
        }
        set((state) => {
          const wallet = {
            ...(state.wallet as TWallet),
            connected: true,
            accounts,
          };
          localStorage.setItem("wallet", JSON.stringify(wallet));
          return { wallet };
        });
      } catch (error: any) {
        toast.error(error.message);
        console.error(error);
      } finally {
        set((state) => ({
          wallet: {
            ...(state.wallet as TWallet),
            loading: false,
          },
        }));
      }
    } else {
      toast.info("Web3 is not available");
    }
  },
  disconnect: () => {
    set({ wallet: null, isContractOwner: false });
    localStorage.removeItem("wallet");
  },
  startGame: async () => {
    set({ isGameStarted: true });
    const gasPrice = await get().web3?.eth.getGasPrice();
    const contract = get().contractInstance;
    const submissionPeriod = get().submissionPeriod;
    const gasEstimation = await contract?.methods
      .startGame()
      .estimateGas({ from: get().wallet?.accounts[0] });
    if (contract) {
      try {
        contract?.methods
          .startGame()
          .send({
            from: get().wallet?.accounts[0],
            gas: (Number(gasEstimation) * 100).toString(),
            gasPrice: (Number(gasPrice) * 1000).toString(),
          })
          .then((data) => console.log("DATA", data))
          .catch((error) => {
            toast.error(error?.message);
            set({ isGameStarted: false });
          });
        const startGameSubscription = await contract?.events.GameStarted();

        startGameSubscription?.on("data", async (eventLog) => {
          toast.success("The game is started");
          const timestamp = eventLog.returnValues.timestamp;
          const endTimerTime =
            (Number(timestamp) + Number(submissionPeriod)) * 1000;
          set({ endTimerTime });

          await startGameSubscription.unsubscribe();
        });
        startGameSubscription.on("error", (error) => {
          set({ isGameStarted: false });
          throw error;
        });
      } catch (error: any) {
        set({ isGameStarted: false });
        console.log("ERROR", error);
        toast.error(error.message);
      }
    }
  },
  setCountdownTimer: (endTime: number) => {
    const countDownDate = new Date(endTime);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = +countDownDate - now;

      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      set({ countdownTimer: seconds });

      if (distance < 0) {
        clearInterval(interval);
        set({ countdownTimer: 0 });
      }
    }, 1000);
  },
  enterGuess: async (values) => {
    const { guess, salt } = values;
    const contract = get().contractInstance;
    if (contract) {
      try {
        const fee: BigInt | undefined = await contract?.methods
          .participationFee()
          .call();
        const TXOptions = {
          from: get().wallet?.accounts[0],
          gas: 5000000,
          value: fee,
        };
        contract?.methods
          // @ts-ignore
          .enterGuess(guess, salt)
          // @ts-ignore
          .send(TXOptions)
          .then((data) => {
            toast.success("Transaction sent");
          })
          .catch((error) => toast.error(error?.message));

        const guessSubmittedSubscription =
          await contract?.events.GuessSubmitted();

        guessSubmittedSubscription?.on("data", async (eventLog) => {
          toast.success("The guess is submitted");

          set({ isGuessesSubmitted: true });

          await guessSubmittedSubscription.unsubscribe();
        });
        guessSubmittedSubscription.on("error", (error) => {
          throw error;
          console.log("Error when subscribing: ", error);
        });
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  },
  // SET GAS ESTIMATION
  revealSaltAndGuess: async (values) => {
    const { guess, salt } = values;
    const contract = get().contractInstance;
    if (contract) {
      const TXOptions = {
        from: get().wallet?.accounts[0],
        gas: 5000000,
      };
      try {
        contract?.methods
          // @ts-ignore
          .revealSaltAndGuess(guess, salt)
          // @ts-ignore
          .send(TXOptions)
          .then((data) => {
            toast.success("Transaction sent");
          })
          .catch((error) => toast.error(error?.message));

        // const allGuessesSubmittedSubscription =
        //   await contract?.events.AllGuessesSubmitted();
        // const allSaltSubmittedSubscription =
        //   await contract?.events.AllGuessesSubmitted();
        //
        // allGuessesSubmittedSubscription?.on("data", async (eventLog) => {
        //   toast.success("All guesses are submitted");
        //
        //   set({ isGuessesSubmitted: true });
        //
        //   await allGuessesSubmittedSubscription.unsubscribe();
        // });
        // allGuessesSubmittedSubscription.on("error", (error) => {
        //   throw error;
        // });
        //
        // allSaltSubmittedSubscription?.on("data", async (eventLog) => {
        //   toast.success("All salt is submitted");
        //
        //   set({ isSaltSubmitted: true });
        //
        //   await allSaltSubmittedSubscription.unsubscribe();
        // });
        // allSaltSubmittedSubscription.on("error", (error) => {
        //   throw error;
        // });
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  },
  calculateWinningGuess: async () => {
    const contract = get().contractInstance;
    if (contract) {
      try {
        await contract?.methods.calculateWinningGuess().send({
          from: get().wallet?.accounts[0],
        });
        const winningGuessCalculatedSubscription =
          await contract?.events.WinningGuessCalculated();
        winningGuessCalculatedSubscription?.on("data", async (eventLog) => {
          toast.success("The winning guess is calculated");
          console.log("The winning guess is calculated");

          set({ isWinningGuessCalculated: true });

          await winningGuessCalculatedSubscription.unsubscribe();
        });
        winningGuessCalculatedSubscription.on("error", (error) => {
          throw error;
        });
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  },
  selectWinner: async () => {
    const contract = get().contractInstance;
    if (contract) {
      try {
        await contract?.methods
          .selectWinner()
          .send({ from: get().wallet?.accounts[0] });
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  },
}));
