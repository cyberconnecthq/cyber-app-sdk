import type { Hex } from "viem";
import { EventEmitter } from "events";

export type WalletEventName = "connect" | "disconnect" | "action";

export type WalletMessage = {
  appId: string;
  target: "CyberWallet" | "CyberApp";
  event: WalletEvent;
  messageId: string;
  appInfo?: AppInfo;
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
    appId: string;
  };
};

export type SendTransaction = (
  transaction: WalletTransaction,
  option?: {
    description?: string;
  },
) => Promise<any>;

export type AppInfo = {
  appId: string;
  name: string;
  icon: string;
};

export enum ErrorType {
  SendTransactionError = "SendTransactionError",
}

export interface EIP1193Provider extends EventEmitter {
  request(args: { method: string; params?: any[] | unknown }): Promise<unknown>;
}

export interface EIP1193ProviderError extends Error {
  code: number;
  data?: unknown;
}
