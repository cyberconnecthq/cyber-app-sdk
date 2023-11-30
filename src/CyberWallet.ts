import type { WalletMessage } from "./types";
import { EventType, type WalletTransaction } from "./types";
import Messenger from "./Messenger";
import CyberAccount from "./CyberAccount";
import Chain from "./Chain";
import { availableChains } from "./config/chains";
import { type AppInfo, ErrorType } from "./types";
import EventError from "./EventError";
import { type SignTypedDataParameters } from "viem";

type CyberWalletParams = {
  contextWindow: Window;
  appInfo: AppInfo;
};

type AvailableChainName = keyof typeof availableChains;

class CyberWallet {
  public contextWindow: Window;
  public connected: boolean;
  public messenger: Messenger;
  public cyberAccount: CyberAccount | null = null;

  // Supported chains
  public optimism: Chain;
  public optimismGoerli: Chain;
  public polygon: Chain;
  public polygonMumbai: Chain;
  public arbitrum: Chain;
  public arbitrumGoerli: Chain;
  public linea: Chain;
  public lineaTestnet: Chain;
  public base: Chain;
  public baseGoerli: Chain;
  public opBnb: Chain;
  public opBnbTestnet: Chain;
  public scrollSepolia: Chain;
  public scroll: Chain;
  public mainnet: Chain;

  constructor({ contextWindow, appInfo }: CyberWalletParams) {
    this.contextWindow = contextWindow;
    this.connected = false;
    this.messenger = new Messenger({
      walletWindow: this.contextWindow,
      appInfo,
    });
    this.cyberAccount = null;

    Object.entries(availableChains).forEach(([key, chain]) => {
      this[key as AvailableChainName] = new Chain({
        id: chain.id,
        sendTransaction: this.bindedSendTransaction,
        appId: appInfo.appId,
      });
    });
  }

  private bindedSendTransaction = this.sendTransaction.bind(this);

  public setConnection(connected: boolean) {
    this.connected = connected;
  }

  public setCyberAccount(cyberAccount: CyberAccount | null) {
    this.cyberAccount = cyberAccount;

    Object.keys(availableChains).forEach((key) => {
      this[key as AvailableChainName].setCyberAccount(cyberAccount);
    });
  }

  private resolveActionResponse(
    message: WalletMessage,
    reject: any,
    resolve: any
  ) {
    if (message.target === "CyberApp") {
      if (message.event.name === "action") {
        if (message.event.data?.error) {
          if (message.event.data?.method === "sendTransaction") {
            reject(
              new EventError({
                name: ErrorType.SendTransactionError,
                details: message.event.data.error,
                shortMessage: "Transaction failed",
              })
            );
          } else {
            reject(new EventError({ details: message.event.data.error }));
          }
        } else {
          resolve(message.event.data?.data);
        }
      }
    }
  }

  public sendTransaction(transaction: WalletTransaction) {
    this.messenger.sendMessage({
      name: "action",
      data: {
        type: EventType.Request,
        method: "sendTransaction",
        data: {
          transaction: {
            ...transaction,
            from: transaction.from || this.cyberAccount?.address,
          },
        },
      },
    });

    return new Promise((resolve, reject) => {
      this.messenger.onMessage((message) => {
        this.resolveActionResponse(message, reject, resolve);
      });
    });
  }

  public signMessage(message: string) {
    this.messenger.sendMessage({
      name: "action",
      data: {
        type: EventType.Request,
        method: "signMessage",
        data: {
          message,
        },
      },
    });

    return new Promise((resolve, reject) => {
      this.messenger.onMessage((message) => {
        this.resolveActionResponse(message, reject, resolve);
      });
    });
  }

  public signTypedData(typedData: SignTypedDataParameters) {
    this.messenger.sendMessage({
      name: "action",
      data: {
        type: EventType.Request,
        method: "signTypedData",
        data: {
          typedData,
        },
      },
    });

    return new Promise((resolve, reject) => {
      this.messenger.onMessage((message) => {
        this.resolveActionResponse(message, reject, resolve);
      });
    });
  }

  public async getAuthToken(): Promise<string> {
    this.messenger.sendMessage({
      name: "action",
      data: {
        type: EventType.Request,
        method: "getAuthToken",
      },
    });

    return new Promise((resolve, reject) => {
      this.messenger.onMessage((message) => {
        this.resolveActionResponse(message, reject, resolve);
      });
    });
  }
}

export default CyberWallet;
