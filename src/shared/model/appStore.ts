import { create } from "zustand";
import Web3, { Contract } from "web3";
import ABI from "../data/GuessTheNumberGame.json";

export type TWallet = {
  connected: boolean;
  loading: boolean;
  accounts: string[];
};
type AppStoreState = {
  web3: Web3 | null;
  contractInstance: Contract<typeof ABI> | null;
  wallet: TWallet | null;
};
type AppStoreActions = {
  init: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
};
type AppStore = AppStoreState & AppStoreActions;

const initialStoreState = {
  web3: null,
  contractInstance: null,
  wallet: null,
};
export const useAppStore = create<AppStore>()((set, get) => ({
  ...initialStoreState,
  init: async () => {
    if (window.ethereum) {
      // const web3 = new Web3(process.env.REACT_APP_PROVIDER_URL);
      const web3 = new Web3(window.ethereum);
      set({ web3 });
      console.log("contractABI", ABI);
      const contractInstance = new web3.eth.Contract(
        ABI,
        process.env.REACT_APP_CONTRACT_ADDRESS
      );
      if (contractInstance) set({ contractInstance });
      // console.log("CONTRACT", contractInstance);
      // console.log("PLAYERS", await contractInstance.methods.owner().call());
      try {
        await contractInstance.methods.startGame().call();
      } catch (error) {
        console.log("ERROR", error);
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
        console.log("WEB3", web3);
        const accounts = await web3.eth.getAccounts();
        console.log("ID", await web3.eth.net.getId());
        console.log("accounts", accounts);
        set((state) => ({
          wallet: {
            ...(state.wallet as TWallet),
            connected: true,
            accounts,
          },
        }));
      } catch (error) {
        console.error(error);
      } finally {
        set((state) => ({
          wallet: {
            ...(state.wallet as TWallet),
            loading: false,
          },
        }));
      }
      // const initialWalletStatus: TWallet = {
      //   connected: false,
      //   loading: true,
      //   accounts: [],
      // };
      // try {
      //   // Запрос разрешения на подключение к кошельку
      //   if (type === EWallet.METAMASK) {
      //     set({
      //       metamask: initialWalletStatus,
      //     });
      //     window.ethereum?.enable();
      //     // await window.ethereum?.request({
      //     //   method: 'eth_requestAccounts'
      //     // });
      //   }
      //   if (type === EWallet.TRUST_WALLET) {
      //     set({
      //       trustWallet: initialWalletStatus,
      //     });
      //     await window.ethereum?.send("eth_requestAccounts");
      //   }
      //   if (type === EWallet.UNI_PASS) {
      //     const upWallet = new UniPassPopupSDK({
      //       env: "test",
      //       // for polygon mumbai
      //       chainType: "polygon",
      //       // choose localStorage if you want to cache user account permanent
      //       storageType: "sessionStorage",
      //       appSettings: {
      //         // theme: 'light',
      //         appName: "UniPass Wallet Demo",
      //         appIcon: "",
      //       },
      //     });
      //     try {
      //       const account = await upWallet.login({
      //         email: true,
      //         eventListener: (event: any) => {
      //           console.log("event", event);
      //           const { type, body } = event;
      //           // if (type === UPEventType.REGISTER) {
      //           console.log("account", body);
      //           // ElMessage.success('a user register');
      //           // }
      //         },
      //         connectType: "both",
      //       });
      //       const { address, email } = account;
      //       console.log("account", address, email);
      //     } catch (err) {
      //       console.log("connect err", err);
      //     }
      //   }
      //   // Получение аккаунтов
      //   const accounts = await web3.eth.getAccounts();
      //   const finalWalletStatus: TWallet = {
      //     connected: true,
      //     loading: false,
      //     accounts,
      //   };
      //
      //   if (type === EWallet.METAMASK)
      //     set({
      //       metamask: finalWalletStatus,
      //       activeWallet: EWallet.METAMASK,
      //     });
      //   if (type === EWallet.TRUST_WALLET)
      //     set({
      //       trustWallet: finalWalletStatus,
      //       activeWallet: EWallet.TRUST_WALLET,
      //     });
      //   if (type === EWallet.UNI_PASS)
      //     set({
      //       uniPass: finalWalletStatus,
      //       activeWallet: EWallet.UNI_PASS,
      //     });
      // } catch (error) {
      //   const errorWalletStatus: TWallet = {
      //     connected: false,
      //     loading: false,
      //     accounts: [],
      //   };
      //   if (type === EWallet.METAMASK)
      //     set({
      //       metamask: errorWalletStatus,
      //     });
      //   if (type === EWallet.TRUST_WALLET)
      //     set({
      //       trustWallet: errorWalletStatus,
      //     });
      //   console.error(error);
      // }
    } else {
      console.log("Web3 is not available");
    }
  },
  disconnect: () => set({ wallet: null }),
}));
