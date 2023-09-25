# Cyber App SDK

Create a CyberWallet app easily with Cyber App SDK.

## Installation

```bash
npm install cyber-app-sdk
```

## Getting Started

### Connect to CyberWallet

```javascript
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

```javascript
const res = await app?.cyberWallet
  ?.sendTransaction({
    to: address,
    value: parseUnits("0.0001", 18),
    data: "0x",
  })
  .catch((err: any) => console.log({ err }));
```
