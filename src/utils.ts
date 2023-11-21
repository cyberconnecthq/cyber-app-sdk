export const isCyberWallet = () =>
  typeof document !== "undefined" &&
  [
    "https://wallet-sandbox.cyber.co/",
    "https://wallet.cyber.co/",
    "https://cyberwallet-sandbox-cyberconnect.vercel.app/",
  ].includes(document.referrer);
