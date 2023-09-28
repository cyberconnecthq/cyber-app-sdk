# Cyber App SDK

Create a CyberWallet app easily with Cyber App SDK.

## Installation

```bash
npm install cyber-app-sdk
```

## Getting Started

### Connect to CyberWallet

```typescript
import { CyberApp } from "@cyberlab/cyber-app-sdk";

const app = new CyberApp({ name: "testapp" });
const { connected } = await app.start();

if (connected) {
  console.log("Connected to CyberWallet");
} else {
  console.log("Connection to CyberWallet failed");
}
```

### Send a transaction

```typescript
async function sendTransaction() {
  const res = await app?.cyberWallet?.optimism
    .sendTransaction({
      to: "0x1234134234",
      value: "0.000000000000000001",
      data: "0x",
    })
    .catch((err: any) => console.log({ err }));
}
```
