import type { Hex, Address } from "viem";
import type { WalletTransaction, SendTransaction } from "./types";
import CyberAccount from "./CyberAccount";

class Chain {
  id: number;
  sendTransactionBase: SendTransaction;
  cyberAccount: CyberAccount | null = null;

  constructor({
    id,
    sendTransaction,
  }: {
    id: number;
    sendTransaction: SendTransaction;
  }) {
    this.id = id;
    this.sendTransactionBase = sendTransaction;
  }

  public setCyberAccount(cyberAccount: CyberAccount | null) {
    this.cyberAccount = cyberAccount;
  }

  public async sendTransaction(
    transaction: Omit<WalletTransaction, "ctx">,
    option?: { description?: string }
  ) {
    if (!this.cyberAccount) {
      return;
    }

    return await this.sendTransactionBase(
      {
        ...transaction,
        from: transaction.from || this.cyberAccount.address,
        ctx: { chainId: this.id, owner: this.cyberAccount.ownerAddress },
      },
      option
    );
  }
}

export default Chain;
