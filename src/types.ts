export type WalletEventName = "connect" | "disconnect" | "action";

export type WalletMessage = {
  appId: string;
  target: "CyberWallet" | "CyberApp";
  event: WalletEvent;
};

export enum EventType {
  Request,
  Response,
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
