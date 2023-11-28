import { availableChains } from "./config/chains";

export const isCyberWallet = () =>
  typeof document !== "undefined" &&
  [
    "https://wallet-sandbox.cyber.co/",
    "https://wallet.cyber.co/",
    "https://cyberwallet-sandbox-cyberconnect.vercel.app/",
  ].includes(document.referrer);

export function isChainUnsupported(chainId: number) {
  return !Object.values(availableChains)
    .map((chain) => chain.id)
    .includes(chainId);
}
