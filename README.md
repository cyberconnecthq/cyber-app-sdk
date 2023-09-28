# CyberApp SDK

Create a CyberAccount app easily with CyberApp SDK.

## Installation

```bash
npm install @cyberlab/cyber-app-sdk
```

## Getting Started

### Connect to CyberAccount

```typescript
import { CyberApp } from "@cyberlab/cyber-app-sdk";

const app = new CyberApp({ name: "Your app name", icon: "Your app icon url" });
const cyberAccount = await app.start();

if (cyberAccount) {
  console.log("Connected to CyberAccount");
} else {
  console.log("Connection to CyberAccount failed");
}
```

### Send a transaction on Optimism

```typescript
async function sendTransaction() {
  const res = await app?.cyberwallet?.optimism
    .sendTransaction({
      to: "0x1234134234",
      value: "0.000000000000000001",
      data: "0x",
    })
    .catch((err: any) => console.log({ err }));
}
```

## Run your local app in CyberAccount Sandbox

1. Start your local app server
2. Go to [CyberAccount Sandbox](http://wallet-sandbox.cyber.co/?_vercel_share=9mH7nlXjAUEU238zCzxJ3fW0TvC2nsX5)
3. Input your app server url
