import type { Hex } from "viem";

export type WalletEventName = "connect" | "disconnect" | "action";

export type WalletMessage = {
  appId: string;
  target: "CyberWallet" | "CyberApp";
  event: WalletEvent;
  messageId: string;
};

export enum EventType {
  Request = "request",
  Response = "response",
}

export type EventData = {
  method: string;
  type?: EventType;
  data?: any;
  error?: any;
};

export type WalletEvent = {
  name: WalletEventName;
  data?: EventData;
};

export type Address = `0x${string}`;

export type Token = {
  contract: Address;
  decimals: number;
};

export type WalletTransaction = {
  from?: Address;
  to: Address;
  value: string;
  data: Hex;
  ctx: {
    chainId: number;
    owner: Address;
  };
};

export type SendTransaction = (
  transaction: WalletTransaction,
  option?: {
    description?: string;
  }
) => Promise<any>;
