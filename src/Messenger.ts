import type { WalletEvent, WalletMessage } from "./types";
import type { AppInfo } from "./types";

type MessengerParams = {
  walletWindow: Window;
  appInfo?: AppInfo;
};

class Messenger {
  public walletWindow: Window;
  public appWindow: Window;
  public appInfo?: AppInfo;

  constructor({ walletWindow, appInfo }: MessengerParams) {
    this.walletWindow = walletWindow;
    this.appWindow = window;
    this.appInfo = appInfo;
  }

  public sendMessage(event: WalletEvent) {
    const messageId = crypto.randomUUID();

    this.postMessage({
      appId: crypto.randomUUID(),
      appInfo: this.appInfo,
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
