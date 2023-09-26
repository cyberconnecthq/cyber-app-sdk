import type { WalletEvent, WalletMessage } from "./types";

type MessengerParams = {
  walletWindow: Window;
};

class Messenger {
  public walletWindow: Window;
  public appWindow: Window;

  constructor({ walletWindow }: MessengerParams) {
    this.walletWindow = walletWindow;
    this.appWindow = window;
  }

  public sendMessage(event: WalletEvent) {
    const messageId = crypto.randomUUID();

    this.postMessage({
      appId: crypto.randomUUID(),
      messageId,
      target: "CyberWallet",
      event,
    });

    return messageId;
  }

  public onMessage(callback: (message: WalletMessage) => void) {
    this.appWindow.onmessage = (event) => {
      callback(event.data);
    };
  }

  private postMessage(message: WalletMessage) {
    this.walletWindow.postMessage(message, "*");
  }
}

export default Messenger;
