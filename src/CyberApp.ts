import CyberAccount from "./CyberAccount";
import CyberWallet from "./CyberWallet";
import Messenger from "./Messenger";
import type { AppInfo } from "./types";

class CyberApp {
  public appId: string;
  public name: string;
  public cyberWallet: CyberWallet;
  public messenger: Messenger;
  public icon: string;

  constructor({ appId, name, icon }: AppInfo) {
    this.appId = appId;
    this.name = name;
    this.icon = icon;
    this.cyberWallet = new CyberWallet({
      contextWindow: window.parent,
      appInfo: { name, icon, appId },
    });
    this.messenger = new Messenger({
      walletWindow: this.cyberWallet.contextWindow,
    });
  }

  public async start(): Promise<CyberAccount> {
    return (await this.connect()) as CyberAccount;
  }

  public async connect(): Promise<CyberAccount> {
    this.messenger.sendMessage({
      name: "connect",
    });

    return await new Promise((resolve, reject) => {
      this.messenger.onMessage((message) => {
        if (message.target === "CyberApp") {
          if (message.event.name === "connect") {
            if (message.event.data?.data?.result === "success") {
              this.cyberWallet?.setConnection(true);
              this.cyberWallet?.setCyberAccount(
                message.event.data?.data?.cyberAccount,
              );
              resolve(message.event.data?.data?.cyberAccount);
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
