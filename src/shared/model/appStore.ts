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
};

type AppStoreActions = {
  isSubmissionPhase: () => boolean;
  isRevealPhase: () => boolean;
  init: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  startGame: () => void;
  enterGuess: (values: { guess: number; salt: number }) => Promise<void>;
  revealSaltAndGuess: (values: {
    guess: number;
    salt: number;
  }) => Promise<void>;
  calculateWinningGuess: () => Promise<void>;
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
    }
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
  disconnect: () => set({ wallet: null, isContractOwner: false }),
  startGame: async () => {
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
            gas: (Number(gasEstimation) * 500).toString(),
            gasPrice: (Number(gasPrice) * 100000).toString(),
            // value: (Number(gasEstimation) * 1000).toString(),
          })
          .then((data) => console.log("DATA", data));
        const startGameSubscription = await contract?.events.GameStarted();

        startGameSubscription?.on("data", async (eventLog) => {
          toast.success("The game is started");
          const timestamp = eventLog.returnValues.timestamp;
          const endTimerTime =
            (Number(timestamp) + Number(submissionPeriod)) * 1000;
          set({ endTimerTime });

          await startGameSubscription.unsubscribe();
        });
        startGameSubscription.on("error", (error) =>
          console.log("Error when subscribing: ", error)
        );
      } catch (error: any) {
        console.log("ERROR", error);
        toast.error(error.message);
      }
    }
  },
  enterGuess: async (values) => {
    const contract = get().contractInstance;
    const fee: BigInt | undefined = await contract?.methods
      .participationFee()
      .call({ from: get().wallet?.accounts[0] });
    console.log("FEE", fee);
    const gasEstimation = await contract?.methods
      .enterGuess()
      .estimateGas({ from: get().wallet?.accounts[0] });
    if (contract) {
      // @ts-ignore
      await contract?.methods.enterGuess(values.guess, values.salt).send({
        from: get().wallet?.accounts[0],
        gas: (Number(gasEstimation) * 600).toString(),
        value: fee ? Number(fee).toString() : "0",
      });
    }
  },
  // TODO add fee
  revealSaltAndGuess: async (values) => {
    const contract = get().contractInstance;
    // const fee: BigInt | undefined = await contract?.methods
    //   .participationFee()
    //   .call();
    const gasEstimation = await contract?.methods
      .startGame()
      .estimateGas({ from: get().wallet?.accounts[0] });
    if (contract) {
      await contract?.methods
        // @ts-ignore
        .revealSaltAndGuess(values.guess, values.salt)
        .send({
          from: get().wallet?.accounts[0],
          gas: (Number(gasEstimation) * 600).toString(),
          // value: fee ? Number(fee).toString() : "0",
        });
    }
  },
  calculateWinningGuess: async () => {
    const contract = get().contractInstance;
    // const fee: BigInt | undefined = await contract?.methods
    //   .participationFee()
    //   .call();
    const gasEstimation = await contract?.methods
      .startGame()
      .estimateGas({ from: get().wallet?.accounts[0] });
    if (contract) {
      await contract?.methods
        // @ts-ignore
        .revealSaltAndGuess(values.guess, values.salt)
        .send({
          from: get().wallet?.accounts[0],
          gas: (Number(gasEstimation) * 600).toString(),
          // value: fee ? Number(fee).toString() : "0",
        });
    }
  },
}));
