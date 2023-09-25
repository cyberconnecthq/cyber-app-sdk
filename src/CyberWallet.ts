import type { WalletMessage } from "./types";
import { EventType } from "./types";
import Messenger from "./Messenger";
import CyberAccount from "./CyberAccount";

type CyberWalletParams = {
  contextWindow: Window;
};

class CyberWallet {
  public contextWindow: Window;
  public connected: boolean;
  public messenger: Messenger;
  public cyberAccount: CyberAccount | null = null;

  constructor({ contextWindow }: CyberWalletParams) {
    this.contextWindow = contextWindow;
    this.connected = false;
    this.messenger = new Messenger({
      walletWindow: this.contextWindow,
    });
    this.cyberAccount = null;
  }

  public setConnection(connected: boolean) {
    this.connected = connected;
  }

  public setCyberAccount(cyberAccount: CyberAccount | null) {
    this.cyberAccount = cyberAccount;
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

  public sendTransaction(data: any) {
    this.messenger.sendMessage({
      name: "action",
      data: {
        type: EventType.Request,
        method: "sendTransaction",
        data,
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
