import { makeAutoObservable } from "mobx";

export type NetworkType = "solana" | "solana-devnet";

export default class Network {
  network: NetworkType;

  constructor() {
    makeAutoObservable(this);
    this.network = "solana-devnet";
  }

  setNetwork(network: NetworkType) {
    this.network = network;
  }

  get currentNetwork() {
    return this.network;
  }
}
