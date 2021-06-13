import { makeAutoObservable } from "mobx";
import { toNumber } from "lodash";

export default class EthStore {
  constructor() {
    makeAutoObservable(this);
  }

  address = "";
  balance = "";
  token!: any;

  setAdress = (addres: string) => {
    this.address = addres;
  };

  setBalance = (balance: string) => {
    this.balance = balance;
  };

  get balanceNumber() {
    return toNumber(this.balance) / Math.pow(10, 18);
  }

  setToken = (token: any) => {
    this.token = token;
  }
}
