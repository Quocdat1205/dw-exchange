import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import Web3API from "web3";
import env from "@utils/constant/env";
import {
  AccountAdmin,
  AccountAdminType,
  WithDraw,
  WithDrawType,
} from "@schema";
import { WithDrawTokenDto } from "./transaction.dto";
import { listNetwork } from "@utils/constant/network";
import { etherToWei, isAddressValid } from "src/helper/handler";
import { Exception } from "@config/exception.config";
import { RESPONSE_CODE } from "@utils/constant/response-code";
import { BscService } from "@modules/bsc/bsc.service";
import CryptoAccount from "send-crypto";
import TronWeb from "tronweb";

const memo = "tttttttttttttttransfer";

@Injectable()
export class TransactionService {
  private web3: Web3API;
  private HttpProvider: any;
  private fullNode: any;
  private solidityNode: any;
  private eventServer: any;

  constructor(
    @InjectModel(AccountAdmin.name)
    private readonly modelAccountAdmin: Model<AccountAdminType>,
    @InjectModel(WithDraw.name)
    private readonly modelWithdraw: Model<WithDrawType>,
    private readonly bscService: BscService,
  ) {
    this.web3 = new Web3API(
      new Web3API.providers.HttpProvider(env.INFURA_KEY_RCP),
    );
    this.HttpProvider = TronWeb.providers.HttpProvider;
    this.fullNode = new this.HttpProvider("https://api.trongrid.io");
    this.solidityNode = new this.HttpProvider("https://api.trongrid.io");
    this.eventServer = new this.HttpProvider("https://api.trongrid.io");
  }

  public async withDrawToken(props: WithDrawTokenDto) {
    const { network, to, symbol, amount } = props;
    // validate address and network
    const validateAddress = await isAddressValid(to, network);
    if (!validateAddress) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Address invalid",
      });
    }

    // transfer and log
    switch (network) {
      case listNetwork.Ethereum:
        const transferEth = await this.transferEthereum(to, amount);
        return transferEth;
      case listNetwork.Bsc:
        const transferBsc = await this.transferBsc(to, amount);
        return transferBsc;
      case listNetwork.Bitcoin:
        const transferBtc = await this.transferBtc(to, amount);
        return transferBtc;
      case listNetwork.Trx:
        const transferTrx = await this.transferTrx(to, amount);
        return transferTrx;
    }
  }

  private async transferBsc(to: string, amount: number) {
    try {
      const walletAdmin = await this.modelAccountAdmin.findOne({
        network: listNetwork.Bsc,
      });

      if (!walletAdmin)
        return Exception({
          statusCode: RESPONSE_CODE.bad_request,
          message: "Account send not found",
        });

      const connectWallet = this.bscService.createWallet(
        walletAdmin.privateKey,
      );

      // transfer token and log
      const tx = await connectWallet.sendTransaction({
        to,
        value: etherToWei(`${amount}`),
      });

      console.log(tx);

      await new this.modelWithdraw({
        network: listNetwork.Bsc,
        to,
        symbol: "BNB",
        value: amount,
        transaction_hash: tx.hash,
      }).save();

      await tx.wait();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  private async transferEthereum(to: string, amount: number) {
    const walletAdmin = await this.modelAccountAdmin.findOne({
      network: listNetwork.Ethereum,
    });

    if (!walletAdmin)
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Account send not found",
      });

    try {
      const transaction = await this.web3.eth.accounts.signTransaction(
        {
          to,
          value: `${etherToWei(amount)}`,
          gas: 2000000,
        },
        walletAdmin.privateKey,
      );

      await new this.modelWithdraw({
        network: listNetwork.Ethereum,
        to,
        symbol: "ETH",
        value: amount,
        transaction_hash: transaction.transactionHash,
      }).save();

      const tx = await this.web3.eth.sendSignedTransaction(
        transaction.rawTransaction,
      );

      console.log(tx);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private async transferBtc(to: string, amount: number) {
    const walletAdmin = await this.modelAccountAdmin.findOne({
      network: listNetwork.Bitcoin,
    });

    // tb1q56zyk473zmm6lvnfvaa7alukyw7t6klqc6fju6
    if (!walletAdmin)
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Account send not found",
      });

    const account = new CryptoAccount(walletAdmin.privateKey);
    // const balance = await account.getBalance("BTC");
    // console.log(balance);

    const txHash = await account
      .send(to, 0.0001, "BTC")
      .on("transactionHash", console.log)
      .on("confirmation", console.log);

    await new this.modelWithdraw({
      network: listNetwork.Bitcoin,
      to,
      symbol: "BTC",
      value: amount,
      transaction_hash: txHash,
    }).save();

    return txHash;
  }

  private async transferTrx(to: string, amount: number) {
    try {
      const walletAdmin = await this.modelAccountAdmin.findOne({
        network: listNetwork.Trx,
      });

      if (!walletAdmin)
        return Exception({
          statusCode: RESPONSE_CODE.bad_request,
          message: "Account send not found",
        });

      const privateKey = walletAdmin.privateKey;
      const tronWeb = new TronWeb(
        this.fullNode,
        this.solidityNode,
        this.eventServer,
        privateKey,
      );
      const unSignedTxn = await tronWeb.transactionBuilder.sendTrx(
        to,
        amount * 10 ** 6,
      );
      const unSignedTxnWithNote =
        await tronWeb.transactionBuilder.addUpdateData(
          unSignedTxn,
          memo,
          "utf8",
        );
      const signedTxn = await tronWeb.trx.sign(unSignedTxnWithNote);
      const ret = await tronWeb.trx.sendRawTransaction(signedTxn);

      await new this.modelWithdraw({
        network: listNetwork.Trx,
        to,
        symbol: "TRX",
        value: amount,
        transaction_hash: ret.txid || signedTxn.txID,
      }).save();

      return Exception({
        statusCode: RESPONSE_CODE.success,
        data: {
          to: to,
          transactionHash: ret.txid || signedTxn.txID,
          value: amount,
        },
      });
    } catch (error) {
      console.log(error);
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        data: {
          to: to,
          value: amount,
        },
        message: "Transfer error, please check again",
      });
    }
  }
}
