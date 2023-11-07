export const isCyberWallet = () =>
  ["https://wallet-sandbox.cyber.co/", "https://wallet.cyber.co/"].includes(
    document.referrer,
  );
