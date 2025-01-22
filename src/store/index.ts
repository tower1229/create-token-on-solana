import { observer } from "mobx-react-lite";
import { autorun } from "mobx";

import Channel from "./modules/channel";

class Store {
  Channel: Channel;
  constructor() {
    this.Channel = new Channel();
  }
}

export interface StoreData {
  Channel: Channel;
}

let store: StoreData | null = null;

export function getStore() {
  if (store === null) {
    store = new Store();
  }
  return store;
}

export { observer, autorun };
