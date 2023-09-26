import type { WalletMessage } from "./types";
import { EventType, type WalletTransaction } from "./types";
import Messenger from "./Messenger";
import CyberAccount from "./CyberAccount";
import Chain from "./Chain";
import { availableChains } from "./config/chains";

type CyberWalletParams = {
  contextWindow: Window;
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

  constructor({ contextWindow }: CyberWalletParams) {
    this.contextWindow = contextWindow;
    this.connected = false;
    this.messenger = new Messenger({
      walletWindow: this.contextWindow,
    });
    this.cyberAccount = null;

    Object.entries(availableChains).forEach(([key, chain]) => {
      this[key as AvailableChainName] = new Chain({
        id: chain.id,
        sendTransaction: this.bindedSendTransaction,
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
          reject(message.event.data.error);
        } else {
          resolve(message.event.data?.data);
        }
      }
    }
  }

  public sendTransaction(
    transaction: WalletTransaction,
    option?: {
      description?: string;
    }
  ) {
    this.messenger.sendMessage({
      name: "action",
      data: {
        type: EventType.Request,
        method: "sendTransaction",
        data: { transaction, option },
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
