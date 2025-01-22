import { makeAutoObservable } from "mobx";

export default class Channel {
  callingCommand: string;

  constructor() {
    this.callingCommand = "";

    makeAutoObservable(this);
  }

  callConnect() {
    this.callingCommand = "connect";
  }

  stopCalling() {
    this.callingCommand = "";
  }
}
