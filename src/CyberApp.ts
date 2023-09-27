import CyberWallet from "./CyberWallet";
import Messenger from "./Messenger";
import type { AppInfo } from "./types";

class CyberApp {
  public name: string;
  public cyberWallet: CyberWallet;
  public messenger: Messenger;
  public icon: string;

  constructor({ name, icon }: AppInfo) {
    this.name = name;
    this.icon = icon;
    this.cyberWallet = new CyberWallet({
      contextWindow: window.parent,
      appInfo: { name, icon },
    });
    this.messenger = new Messenger({
      walletWindow: this.cyberWallet.contextWindow,
    });
  }

  public async start() {
    return await this.connect();
  }

  public connect() {
    this.messenger.sendMessage({
      name: "connect",
    });

    return new Promise((resolve, reject) => {
      this.messenger.onMessage((message) => {
        if (message.target === "CyberApp") {
          if (message.event.name === "connect") {
            if (message.event.data?.data?.result === "success") {
              this.cyberWallet.setConnection(true);
              this.cyberWallet.setCyberAccount(
                message.event.data?.data?.cyberAccount,
              );
              resolve({ connected: true });
            } else {
              if (message.event.data?.error) {
                reject(message.event.data?.error);
              }
            }
          }
        }
      });
    });
  }
}

export default CyberApp;
