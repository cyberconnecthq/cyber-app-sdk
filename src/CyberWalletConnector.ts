import CyberProvider from "./CyberProvider";
import CyberApp from "./CyberApp";
import {
  getAddress,
  RpcError,
  SwitchChainError,
  numberToHex,
  ClientChainNotConfiguredError,
} from "viem";
import { isCyberWallet } from "./utils";
import { ConnectorNotFoundError, normalizeChainId } from "@wagmi/connectors";
import { createConnector, ProviderNotFoundError } from "@wagmi/core";

type CyberWalletConnectorParameters = {
  name?: string;
  icon?: string;
  appId?: string;
  shimDisconnect?: boolean;
};

function cyberWalletConnector(parameters: CyberWalletConnectorParameters) {
  const { name, icon, appId, shimDisconnect = false } = parameters;

  type Provider = CyberProvider | undefined;
  type Properties = {};
  type StorageItem = Record<string, boolean>;

  const app = new CyberApp({
    appId: appId || "",
    name: name || "",
    icon: icon || "",
  });

  let provider_: Provider;

  return createConnector<Provider, Properties, StorageItem>((config) => {
    return {
      icon: "",
      id: "cyberWallet",
      name: "CyberWallet",
      type: "cyberWallet",
      async connect() {
        const provider = await this.getProvider();
        if (!provider) throw new ConnectorNotFoundError();
        const accounts = await this.getAccounts();
        const chainId = await this.getChainId();

        provider.on("disconnect", this.onDisconnect.bind(this));
        provider.on("chainChanged", this.onChainChanged);

        // Remove disconnected shim if it exists
        if (shimDisconnect)
          await config.storage?.removeItem(
            config.storage?.key + ".disconnected",
          );

        return { accounts, chainId };
      },
      async disconnect() {
        const provider = await this.getProvider();
        if (!provider) throw new ProviderNotFoundError();

        provider.removeListener("disconnect", this.onDisconnect.bind(this));

        // Add shim signalling connector is disconnected
        if (shimDisconnect)
          await config.storage?.setItem(
            config?.storage.key + ".disconnected",
            true,
          );
      },
      async getAccounts() {
        const provider = await this.getProvider();
        if (!provider) throw new ProviderNotFoundError();
        return (await provider.request({ method: "eth_accounts" })).map(
          getAddress,
        );
      },
      async getChainId() {
        const provider = await this.getProvider();
        if (!provider) throw new ProviderNotFoundError();
        return normalizeChainId(provider.chainId);
      },

      getProvider: async () => {
        if (provider_) return provider_;

        const isInCyberWallet = isCyberWallet();

        if (!isInCyberWallet) {
          console.error("Could not load CyberWallet information.");
        }

        if (!appId) {
          throw Error("CyberWalletConnector: appId is required");
        }

        // cyberwallet provider
        const cyberProvider = new CyberProvider({
          app: app,
          chainId: config.chains[0].id, // default chain ID
        });

        provider_ = cyberProvider;

        return provider_;
      },
      async isAuthorized() {
        try {
          const isDisconnected =
            shimDisconnect &&
            // If shim exists in storage, connector is disconnected
            (await config.storage?.getItem(
              config.storage?.key + ".disconnected",
            ));
          if (isDisconnected) return false;

          const accounts = await this.getAccounts();
          return !!accounts.length;
        } catch {
          return false;
        }
      },
      onAccountsChanged() {
        // Not relevant for Safe because changing account requires app reload.
      },
      onChainChanged(chain) {
        const chainId = normalizeChainId(chain);
        config.emitter.emit("change", { chainId });
      },
      onDisconnect() {
        config.emitter.emit("disconnect");
      },
      async switchChain({ chainId }) {
        const provider = await this.getProvider();
        if (!provider) throw new ProviderNotFoundError();

        const chain = config.chains.find((x) => x.id === chainId);
        if (!chain)
          throw new SwitchChainError(new ClientChainNotConfiguredError());

        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: numberToHex(chainId) }],
          });

          return chain;
        } catch (err) {
          const error = err as RpcError;
          throw new SwitchChainError(error);
        }
      },
    };
  });
}

export default cyberWalletConnector;
