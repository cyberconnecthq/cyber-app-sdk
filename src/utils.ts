export const isCyberWallet = ({ testnet }: { testnet?: boolean }) =>
  document.referrer ===
  (testnet ? "https://wallet-sandbox.cyber.co/" : "https://wallet.cyber.co/");
