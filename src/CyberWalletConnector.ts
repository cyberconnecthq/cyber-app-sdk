import CyberProvider from "./CyberProvider";
import CyberApp from "./CyberApp";
import {
  createWalletClient,
  getAddress,
  SwitchChainError,
  numberToHex,
  custom,
  ProviderRpcError,
  ResourceUnavailableRpcError,
  UserRejectedRequestError,
} from "viem";
import { type Chain, optimismGoerli } from "viem/chains";
import { isCyberWallet } from "./utils";
import {
  Connector,
  ConnectorNotFoundError,
  normalizeChainId,
  ChainNotConfiguredForConnectorError,
} from "@wagmi/connectors";
import { availableChains } from "./config/chains";
import { type WalletClient } from "wagmi";

type CyberWalletConnectorOptions = {
  name?: string;
  icon?: string;
  appId?: string;
  shimDisconnect?: boolean;
};

class CyberWalletConnector extends Connector<
  CyberProvider,
  CyberWalletConnectorOptions
> {
  provider?: CyberProvider;
  readonly id = "cyberwallet";
  readonly name = "CyberWallet";
  ready: boolean;
  protected shimDisconnectKey = `${this.id}.shimDisconnect`;

  constructor({
    chains,
    options: options_,
  }: {
    chains?: Chain[];
    options?: CyberWalletConnectorOptions;
  }) {
    const options = {
      shimDisconnect: false,
      ...options_,
    };

    const chainIds = chains?.map((chain) => chain.id);
    super({
      chains: Object.values(availableChains).filter(
        (chain) => chainIds?.includes(chain.id),
      ),
      options,
    });
    this.id = "cyberwallet";
    this.name = "CyberWallet";
    this.getProvider();
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider();
      if (!provider) throw new ConnectorNotFoundError();

      if (provider.on) {
        provider.on("accountsChanged", this.onAccountsChanged);
        provider.on("chainChanged", this.onChainChanged);
        provider.on("disconnect", this.onDisconnect);
      }

      this.emit("message", { type: "connecting" });

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      const account = getAddress(accounts[0] as string);
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        if (chain) {
          id = chain.id;
          unsupported = this.isChainUnsupported(id);
        }
      }

      // Add shim to storage signalling wallet is connected
      if (this.options.shimDisconnect) {
        this.storage?.setItem(this.shimDisconnectKey, true);
      }

      return { account, chain: { id, unsupported } };
    } catch (error) {
      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error as Error);
      if ((error as ProviderRpcError).code === -32002)
        throw new ResourceUnavailableRpcError(error as ProviderRpcError);
      throw error;
    }
  }

  async disconnect() {
    const provider = await this.getProvider();
    if (!provider?.removeListener) return;

    provider.removeListener("accountsChanged", this.onAccountsChanged);
    provider.removeListener("chainChanged", this.onChainChanged);
    provider.removeListener("disconnect", this.onDisconnect);

    // Remove shim signalling wallet is disconnected
    if (this.options.shimDisconnect)
      this.storage?.removeItem(this.shimDisconnectKey);
  }

  async getAccount() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const accounts = await provider.request({
      method: "eth_accounts",
    });
    // return checksum address
    return getAddress(accounts[0] as string);
  }

  async getChainId() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    return provider.request({ method: "eth_chainId" }).then(normalizeChainId);
  }

  async getProvider() {
    const isInCyberWallet = isCyberWallet();

    if (!isInCyberWallet) {
      console.error("Could not load CyberWallet information.");
    }

    if (!this.provider) {
      if (!this.options.appId) {
        throw Error("CyberWalletConnector: appId is required");
      }

      const app = new CyberApp({
        appId: this.options.appId,
        name: this.options.name || "",
        icon: this.options.icon || "",
      });

      // cyberwallet provider
      const cyberProvider = new CyberProvider({
        app: app,
        chainId: this.chains[0].id, // default chain ID
      });

      this.provider = cyberProvider;
      this.ready = true;
    }

    return this.provider;
  }

  async getWalletClient({
    chainId,
  }: { chainId?: number } = {}): Promise<WalletClient> {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);

    const chain = this.chains.find((x: Chain) => x.id === chainId);
    if (!provider) throw new Error("provider is required.");

    return createWalletClient({
      account,
      chain: chain!,
      transport: custom(provider),
    });
  }

  async isAuthorized() {
    try {
      if (
        this.options.shimDisconnect &&
        // If shim does not exist in storage, wallet is disconnected
        !this.storage?.getItem(this.shimDisconnectKey)
      )
        return false;

      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  async switchChain(chainId: number) {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const id = numberToHex(chainId);

    try {
      await Promise.all([
        provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: id }],
        }),
        new Promise<void>((res) => {
          this.getChainId().then((currentChainId) => {
            if (currentChainId === chainId) res();
          });
          this.on("change", ({ chain }) => {
            if (chain?.id === chainId) res();
          });
        }),
      ]);
      return (
        this.chains.find((x: Chain) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { name: "Ether", decimals: 18, symbol: "ETH" },
          rpcUrls: { default: { http: [""] }, public: { http: [""] } },
        }
      );
    } catch (error) {
      const chain = this.chains.find((x: Chain) => x.id === chainId);
      if (!chain) {
        throw new ChainNotConfiguredForConnectorError({
          chainId,
          connectorId: this.id,
        });
      } else {
        throw new SwitchChainError(error as Error);
      }
    }
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit("disconnect");
    else
      this.emit("change", {
        account: getAddress(accounts[0] as string),
      });
  };

  public isChainUnsupported(chainId: number) {
    return !Object.values(availableChains)
      .map((chain) => chain.id)
      .includes(chainId);
  }

  protected onChainChanged = (chainId: number | string) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  };

  protected onDisconnect() {
    this.emit("disconnect");
  }
  protected isUserRejectedRequestError(error: unknown) {
    return (error as ProviderRpcError).code === 4001;
  }
}

export default CyberWalletConnector;
