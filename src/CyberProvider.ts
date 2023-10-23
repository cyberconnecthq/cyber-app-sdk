import CyberApp from "./CyberApp";
import type { EIP1193Provider } from "./types";
import { availableChains, type ChainName } from "./config/chains";
import { EventEmitter } from "events";
import {
  ProviderDisconnectedError,
  createPublicClient,
  http,
  type PublicClient,
} from "viem";
import Chain from "./Chain";

class CyberProvider extends EventEmitter implements EIP1193Provider {
  public name: "CyberWallet";
  public cyberApp: CyberApp;
  public chainId: number;
  public readonly isMetaMask: any;
  public _events: {
    connect?: () => void;
  };
  public chain?: Chain;
  public publicClient: PublicClient;

  constructor({ app, chainId }: { app: CyberApp; chainId: number }) {
    super();
    this.name = "CyberWallet";
    this.cyberApp = app;
    this.chainId = chainId;
    this.isMetaMask = false;
    this.chain = this.getChainByChainId(this.chainId);
    this._events = {};
    this.publicClient = this.setPublicClient(this.chainId);
  }

  setPublicClient(chainId: number): PublicClient {
    return createPublicClient({
      chain: Object.values(availableChains).find(
        (chain) => chain.id === chainId,
      )!,
      transport: http(),
    });
  }

  async connect(): Promise<void> {
    this.emit("connect", { chainId: `0x${this.chainId.toString(16)}` });
    return;
  }

  async disconnect(): Promise<void> {
    this.emit("disconnect", new ProviderDisconnectedError(Error()));
    return;
  }

  private getChainKeyByChainId(chainId: number) {
    const chainObj = Object.entries(availableChains).find(
      ([_, chain]) => chain.id === chainId,
    );

    if (!chainObj) {
      throw new Error(`ChainId ${chainId} is not supported.`);
    }

    return chainObj[0] as ChainName;
  }

  private getChainByChainId(id: number) {
    const chainKey = this.getChainKeyByChainId(id);
    return this.cyberApp.cyberWallet?.[chainKey];
  }

  async request(request: { method: string; params?: any[] }): Promise<any> {
    const { method, params = [] } = request;

    switch (method) {
      case "wallet_switchEthereumChain": {
        this.chainId = params[0].chainId;
        this.chain = this.getChainByChainId(Number(this.chainId));
        this.publicClient = this.setPublicClient(Number(this.chainId));
        this.emit("chainChanged", this.chainId);
        return;
      }

      case "eth_chainId":
        return `0x${this.chainId.toString(16)}`;

      case "eth_sendTransaction": {
        const data = params[0].data || "0x";

        return this.chain?.sendTransaction({ ...params[0], data });
      }

      case "eth_requestAccounts": {
        if (!this.cyberApp.cyberWallet?.cyberAccount) {
          await this.cyberApp.connect();
        }

        return [this.cyberApp.cyberWallet?.cyberAccount?.address];
      }

      case "eth_accounts": {
        if (!this.cyberApp.cyberWallet?.cyberAccount) {
          await this.cyberApp.connect();
        }
        return [this.cyberApp.cyberWallet?.cyberAccount?.address];
      }

      default:
        return await this.publicClient.request({
          method: method as any,
          params: params as any,
        });
    }
  }
}

export default CyberProvider;
