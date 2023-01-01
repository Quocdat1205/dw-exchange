import { Injectable } from "@nestjs/common";
import Web3API from "web3";
import env from "@utils/constant/env";
import { BscService } from "@modules/bsc/bsc.service";
import TronWeb from "tronweb";
import { Interval } from "@nestjs/schedule";

@Injectable()
export class TrackerService {
  private web3: Web3API;
  private HttpProvider: any;
  private fullNode: any;
  private solidityNode: any;
  private eventServer: any;
  private tronWeb: any;

  constructor(private readonly bscService: BscService) {
    this.web3 = new Web3API(
      new Web3API.providers.HttpProvider(env.INFURA_KEY_RCP),
    );
    this.HttpProvider = TronWeb.providers.HttpProvider;
    this.fullNode = new this.HttpProvider("https://api.trongrid.io");
    this.solidityNode = new this.HttpProvider("https://api.trongrid.io");
    this.eventServer = new this.HttpProvider("https://api.trongrid.io");
    this.tronWeb = new TronWeb(this.fullNode, this.solidityNode);
  }

  async trackerTrx() {
    const tronWeb = new TronWeb(
      this.fullNode,
      this.solidityNode,
      this.eventServer,
      "D7A57ACC56073F5FBA700F739E16EE486739AEE589B66527202A7A4623017785",
    );

    const transactions = await tronWeb.trx.getTransactionsRelated(
      "TSrsPar2bjxSUepC3if4ztRnb7VxsnRNjC",
      "all",
      10,
      0,
    );

    console.log("transaction", transactions);
  }
}
