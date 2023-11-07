# CyberApp SDK

Create a CyberAccount app easily with CyberApp SDK.

## Installation

```bash
npm install @cyberlab/cyber-app-sdk
```

## Getting Started

There are two ways to create a CyberApp:

1. using `CyberProvider` and `CyberApp` to create a EIP-1193 provider with existing Ethereum libraries like wagmi.
2. using `CyberApp` directly

Before using the SDK, please go to [Cyber Dev Center](https://dashboard.cyberconnect.me/) to create an APP ID for your app.

### 1. Using with wagmi

```typescript copy
import { CyberApp, CyberProvider } from "@cyberlab/cyber-app-sdk";
import { InjectedConnector } from "wagmi/connectors/injected";

let cyberProvider: CyberProvider | undefined;

if (typeof window !== "undefined") {
  const app = new CyberApp({
    appId: "your app id", // required
    name: "My app", // required
    icon: "https://icon.com", // required
  });

  // cyberwallet provider
  const cyberProvider = new CyberProvider({
    app: app,
    chainId: optimismGoerli.id, // default chain ID
  });
}

const cyberWalletConnector = new InjectedConnector({
  chains,
  options: {
    name: "CyberWallet",
    getProvider: () => {
      return cyberProvider;
    },
  },
});
```

### 2. Using with CyberApp Directly

#### Connect to CyberWallet

```typescript copy
import { CyberApp } from "@cyberlab/cyber-app-sdk";

const app = new CyberApp({
  appId: "your app id", // required
  name: "My app", // required
  icon: "https://icon.com", // required
});

app.start().then((cyberAccount) => {
  if (cyberAccount) {
    console.log("Connected to CyberWallet");
  } else {
    console.log("Failed to connect to CyberWallet");
  }
});
```

#### Send native tokens on Optimism

```typescript copy
async function sendTransaction() {
  const res = await app?.cyberwallet?.optimism
    .sendTransaction({
      to: "0x370CA01D7314e3EEa59d57E343323bB7e9De24C6",
      value: "0.01",
      data: "0x",
    })
    .catch((err: Error) => console.log({ err }));
}
```

## Run your local app in CyberWallet Sandbox

1. Start your local app server
2. Go to [CyberWallet Sandbox](http://wallet-sandbox.cyber.co)
3. Input your app server URL
