import type { Address } from "./types";

class CyberAccount {
  public address: Address;
  public ownerAddress: Address;
  constructor({
    address,
    ownerAddress,
  }: {
    address: Address;
    ownerAddress: Address;
  }) {
    this.address = address;
    this.ownerAddress = ownerAddress;
  }
}

export default CyberAccount;
