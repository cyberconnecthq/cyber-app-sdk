import CyberProvider from "./CyberProvider";
import CyberApp from "./CyberApp";
import { getAddress } from "viem";
import { isCyberWallet } from "./utils";
import { ConnectorNotFoundError, normalizeChainId } from "@wagmi/connectors";
import { availableChains } from "./config/chains";
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
  type StorageItem = { "cyberWallet.disconnected": true };

  const app = new CyberApp({
    appId: appId || "",
    name: name || "",
    icon: icon || "",
  });

  // const chainIds = chains?.map((chain) => chain.id);
  // const chains = Object.values(availableChains).filter(
  //   (chain) => chainIds?.includes(chain.id),
  // );
  //
  // const onAccountsChanged = (accounts: string[]) => {
  //   if (accounts.length === 0) this.emit("disconnect");
  //   else
  //     this.emit("change", {
  //       account: getAddress(accounts[0] as string),
  //     });
  // };
  //
  // const isChainUnsupported = (chainId: number) => {
  //   return !Object.values(availableChains)
  //     .map((chain) => chain.id)
  //     .includes(chainId);
  // };
  //
  // const onChainChanged = (chainId: number | string) => {
  //   const id = normalizeChainId(chainId);
  //   const unsupported = this.isChainUnsupported(id);
  //   this.emit("change", { chain: { id, unsupported } });
  // };
  //
  // const onDisconnect = () => {
  //   this.emit("disconnect");
  // };
  // const isUserRejectedRequestError = (error: unknown) => {
  //   return (error as ProviderRpcError).code === 4001;
  // };

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

        // Remove disconnected shim if it exists
        if (shimDisconnect)
          await config.storage?.removeItem("cyberWallet.disconnected");

        return { accounts, chainId };
      },
      async disconnect() {
        const provider = await this.getProvider();
        if (!provider) throw new ProviderNotFoundError();

        provider.removeListener("disconnect", this.onDisconnect.bind(this));

        // Add shim signalling connector is disconnected
        if (shimDisconnect)
          await config.storage?.setItem("cyberWallet.disconnected", true);
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

        return cyberProvider;
      },
      async isAuthorized() {
        try {
          const isDisconnected =
            shimDisconnect &&
            // If shim exists in storage, connector is disconnected
            (await config.storage?.getItem("cyberWallet.disconnected"));
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
    };
  });
}

export default cyberWalletConnector;
