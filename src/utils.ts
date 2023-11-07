export const isCyberWallet = () =>
  [
    "https://wallet-sandbox.cyber.co/",
    "https://wallet.cyber.co/",
    "https://cyberwallet-sandbox-cyberconnect.vercel.app/",
  ].includes(document.referrer);
