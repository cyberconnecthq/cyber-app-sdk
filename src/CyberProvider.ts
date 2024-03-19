import CyberApp from "./CyberApp";
import type { EIP1193Provider } from "./types";
import { availableChains, type ChainName } from "./config/chains";
import { EventEmitter } from "events";
import {
  ProviderDisconnectedError,
  createPublicClient,
  http,
  hexToString,
  type PublicClient,
  type Hex,
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
  public publicClient?: PublicClient;

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

  setPublicClient(chainId: number): PublicClient | undefined {
    const targetChain = Object.values(availableChains).find(
      (chain) => chain.id === chainId
    );
    return targetChain
      ? createPublicClient({
          chain: Object.values(availableChains).find(
            (chain) => chain.id === chainId
          )!,
          transport: http(),
        })
      : undefined;
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
      ([_, chain]) => chain.id === chainId
    );

    if (!chainObj) {
      console.error(`ChainId ${chainId} is not supported.`);
      return;
    }

    return chainObj[0] as ChainName;
  }

  private getChainByChainId(id: number) {
    const chainKey = this.getChainKeyByChainId(id);
    return chainKey ? this.cyberApp.cyberWallet?.[chainKey] : undefined;
  }

  async request(request: { method: string; params?: any }): Promise<any> {
    const { method, params = [] } = request;

    switch (method) {
      case "wallet_switchEthereumChain": {
        this.chainId = Number(params[0].chainId as Hex);
        this.chain = this.getChainByChainId(this.chainId);
        this.publicClient = this.setPublicClient(this.chainId);
        await this.cyberApp.cyberWallet.switchChain(this.chainId);
        // https://eips.ethereum.org/EIPS/eip-1193#chainchanged-1
        this.emit("chainChanged", params[0].chainId);
        return;
      }

      case "personal_sign":
        return this.cyberApp.cyberWallet?.signMessage(hexToString(params[0]));

      case "eth_signTypedData":
      case "eth_signTypedData_v4": {
        const [address, typedData] = params;
        const parsedTypedData =
          typeof typedData === "string" ? JSON.parse(typedData) : typedData;

        if (
          this.cyberApp.cyberWallet.cyberAccount?.address.toLowerCase() !==
          address.toLowerCase()
        ) {
          throw new Error("The address is invalid");
        }
        const signature =
          await this.cyberApp.cyberWallet.signTypedData(parsedTypedData);

        return signature || "0x";
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
        return await this.publicClient?.request({
          method: method as any,
          params: params as any,
        });
    }
  }
}

export default CyberProvider;
