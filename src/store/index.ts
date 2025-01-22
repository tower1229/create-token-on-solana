import { observer } from "mobx-react-lite";
import { autorun } from "mobx";

import Channel from "./modules/channel";
import Network from "./modules/network";

class Store {
  Channel: Channel;
  Network: Network;

  constructor() {
    this.Channel = new Channel();
    this.Network = new Network();
  }
}

export interface StoreData {
  Channel: Channel;
  Network: Network;
}

let store: StoreData | null = null;

export function getStore() {
  if (store === null) {
    store = new Store();
  }
  return store;
}

export { observer, autorun };
