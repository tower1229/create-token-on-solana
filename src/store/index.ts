import { observer } from "mobx-react-lite";
import { autorun } from "mobx";

import Channel from "./modules/channel";
import DataStore from "./modules/dataStore";

class Store {
  Channel: Channel;
  DataStore: DataStore;
  constructor() {
    this.Channel = new Channel();
    this.DataStore = new DataStore();
  }
}

export interface StoreData {
  Channel: Channel;
  DataStore: DataStore;
}

let store: StoreData | null = null;

export function getStore() {
  if (store === null) {
    store = new Store();
  }
  return store;
}

export { observer, autorun };
