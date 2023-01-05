import { Injectable } from "@nestjs/common";
import Web3API from "web3";
import env from "@utils/constant/env";
import { BscService } from "@modules/bsc/bsc.service";
import TronWeb from "tronweb";
import { Interval } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import {
  BitcoinTracker,
  BitcoinTrackerType,
  AccountERC20,
  AccountERC20Type,
  Deposit,
  DepositType,
  AccountTrx,
  AccountTrxType,
  AccountBtc,
  AccountBtcType,
} from "@schema";
import { Model } from "mongoose";
import axios from "axios";
import { listNetwork } from "@utils/constant/network";
import { sleep, weiToEther } from "src/helper/handler";
import { LoggerService } from "@modules/logger/logger.service";
import { checkObject } from "src/helper/handler";
import { fromHex } from "tron-format-address";

const URL_BLOCKCHAIN = "https://blockchain.info/tx";
const URL_BSC = "https://bsc-dataseed1.binance.org/";
// const URL_TRACKER_BTC = "https://chain.api.btc.com/v3/address/address/tx";
const pageSize = 30;

@Injectable()
export class TrackerService {
  private web3: Web3API;
  private web3Bsc: Web3API;
  private HttpProvider: any;
  private fullNode: any;
  private solidityNode: any;
  private eventServer: any;

  constructor(
    private readonly bscService: BscService,
    @InjectModel(BitcoinTracker.name)
    private readonly modelBitcoinTracker: Model<BitcoinTrackerType>,
    @InjectModel(Deposit.name)
    private readonly modelDeposit: Model<DepositType>,
    @InjectModel(AccountERC20.name)
    private readonly modelAccountErc20: Model<AccountERC20Type>,
    @InjectModel(AccountTrx.name)
    private readonly modelAccountTrx: Model<AccountTrxType>,
    @InjectModel(AccountBtc.name)
    private readonly modelAccountBitcoin: Model<AccountBtcType>,
  ) {
    this.web3 = new Web3API(
      new Web3API.providers.HttpProvider(env.INFURA_KEY_RCP),
    );
    this.web3Bsc = new Web3API(new Web3API.providers.HttpProvider(URL_BSC));
    this.HttpProvider = TronWeb.providers.HttpProvider;
    this.fullNode = new this.HttpProvider(env.TRX_RPC);
    this.solidityNode = new this.HttpProvider(env.TRX_RPC);
    this.eventServer = new this.HttpProvider(env.TRX_RPC);
  }

  @Interval("Tracker transaction trx", 1000 * 60 * 1.5) // 1.25 minutes
  async trackerTrx() {
    const tronWeb = new TronWeb(
      this.fullNode,
      this.solidityNode,
      this.eventServer,
    );
    // get all address trx
    const account = await this.modelAccountTrx
      .find()
      .select({ address: 1, _id: 0, hex: 1 });
    const convertToArray = account.reduce((value, cur) => {
      return {
        ...value,
        [cur.hex]: cur.address,
      };
    }, {});

    const block = await tronWeb.trx.getCurrentBlock();
    const transactions = block.transactions;

    if (block != null && transactions != null) {
      for (const transaction of transactions) {
        try {
          if (transaction.raw_data.contract[0].parameter.value.amount) {
            const value = transaction.raw_data.contract[0].parameter.value;

            if (
              convertToArray[
                transaction.raw_data.contract[0].parameter.value.to_address
              ]
            ) {
              console.log("DEPOSIT SUCCESS");

              const result = {
                network: listNetwork.Trx,
                from: fromHex(
                  transaction.raw_data.contract[0].parameter.value
                    .owner_address,
                ),
                to: fromHex(
                  transaction.raw_data.contract[0].parameter.value.to_address,
                ),
                symbol: "TRX",
                value: value.amount / 10 ** 6,
                contractAddress: null,
                gasPrice: 0,
                gasUse: 0,
                blockNumber: 0,
                transaction_hash: transaction.txID,
                category: 0,
                confirmations: 0,
                cumulativeGasUsed: 0,
                effectiveGasPrice: 0,
              };

              await new this.modelDeposit({ ...result }).save();
            }
          }

          await sleep(100);
        } catch (error) {
          console.log(error);
          continue;
        }
      }
    }
  }

  @Interval("Track and update log send transaction bitcoin", 1000 * 60 * 2.25) // 1.75 minutes
  async trackerAddTransactionBitcoin() {
    LoggerService.log(`Logger tracker transaction on bitcoin network`);
    try {
      const bitcoinTrackers = await this.modelBitcoinTracker.find({
        isTracker: false,
      });

      for (const bitcoin of bitcoinTrackers) {
        const { data } = await axios.get(
          `${URL_BLOCKCHAIN}/${bitcoin.transactionHash}?format=json`,
        );
        const check = checkObject(data);
        if (check) {
          const result = {
            network: listNetwork.Bitcoin,
            from: data.inputs[0].prev_out.addr,
            to: data.out[0].addr,
            symbol: "BTC",
            value: data.inputs[0].prev_out.value,
            contractAddress: null,
            gasPrice: 0,
            gasUse: weiToEther(data.fee),
            blockNumber: 0,
            transaction_hash: data.hash,
            category: 1,
            confirmations: 0,
            cumulativeGasUsed: 0,
            effectiveGasPrice: 0,
          };
          await new this.modelDeposit({ ...result }).save();

          bitcoin.isTracker = true;
          await bitcoin.save();
        }

        await sleep(100);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Interval("Tracker transaction ethereum", 1000 * 60 * 25) // 1.25 minutes
  async getTransactionHistoryBscAndEthereum() {
    LoggerService.log(`Tracker transaction ethereum`);
    const account = await this.modelAccountErc20.find().select({
      address: 1,
      _id: 0,
    });
    const convertToArray = account.reduce((value, cur) => {
      return {
        ...value,
        [cur.address.toLowerCase()]: cur.address.toLowerCase(),
      };
    }, {});

    const block = await this.web3.eth.getBlock("safe");
    // const number = block.number;

    const transactions = block.transactions;

    if (block != null && transactions != null) {
      for (const txHash of block.transactions) {
        try {
          const tx = await this.web3.eth.getTransaction(txHash);
          if (tx.to) {
            if (convertToArray[tx.to.toLowerCase()]) {
              const result = {
                network: listNetwork.Ethereum,
                from: tx.from,
                to: tx.to,
                symbol: "ETH",
                value: weiToEther(tx.value),
                contractAddress: null,
                gasPrice: weiToEther(tx.gasPrice),
                gasUse: weiToEther(`${tx.gas}`),
                blockNumber: tx.blockNumber,
                transaction_hash: tx.hash,
                category: 0, // 1: send, 0: receive
                confirmations: 0,
                cumulativeGasUsed: 0,
                effectiveGasPrice: 0,
              };

              await new this.modelDeposit({ ...result }).save();
            }
          }
          await sleep(100);
        } catch (error) {
          console.error(error);
          continue;
        }
      }
    }
  }

  @Interval("Tracker transaction bsc", 1000 * 60 * 2.1) // 1 minutes
  async trackerBsc() {
    LoggerService.log(`Tracker transaction bsc`);
    const account = await this.modelAccountErc20.find().select({
      address: 1,
      _id: 0,
    });

    const convertToArray = account.reduce((value, cur) => {
      return {
        ...value,
        [cur.address.toLowerCase()]: cur.address.toLowerCase(),
      };
    }, {});
    const block = await this.web3Bsc.eth.getBlock("latest");

    const transactions = block.transactions;

    if (block != null && transactions != null) {
      for (const txHash of block.transactions) {
        try {
          const tx = await this.web3.eth.getTransaction(txHash);
          if (tx && tx.to) {
            if (convertToArray[tx.to.toLowerCase()]) {
              const result = {
                network: listNetwork.Ethereum,
                from: tx.from,
                to: tx.to,
                symbol: "ETH",
                value: weiToEther(tx.value),
                contractAddress: null,
                gasPrice: weiToEther(tx.gasPrice),
                gasUse: weiToEther(`${tx.gas}`),
                blockNumber: tx.blockNumber,
                transaction_hash: tx.hash,
                category: 0, // 1: send, 0: receive
                confirmations: 0,
                cumulativeGasUsed: 0,
                effectiveGasPrice: 0,
              };

              await new this.modelDeposit({ ...result }).save();
            }
          }
        } catch (error) {
          console.error(error);
          continue;
        }
      }
    }
  }

  @Interval(1000 * 60 * 5) // 5 minutes
  async trackerBitcoin() {
    LoggerService.log(`Tracker bitcoin network`);

    const { data: get_total_page } = await axios.get(
      ` ${env.BTC_FETCH}/block/latest/tx?verbose=2`,
    );

    if (get_total_page.err_code !== 200) return;

    try {
      const page_total = get_total_page.data.page_total;
      const account = await this.modelAccountBitcoin.find().select({
        address: 1,
        _id: 0,
      });
      const convertToArray = account.reduce((value, cur) => {
        return {
          ...value,
          [cur.address]: cur.address,
        };
      }, {});

      for (let i = 1; i <= page_total; i++) {
        try {
          const { data } = await axios.get(
            ` ${env.BTC_FETCH}/block/latest/tx?verbose=2&pageSize=${pageSize}&page=${i}`,
          );
          if (data.err_code !== 200) continue;

          const list = data.data.list;

          if (!list) return;

          for (const child of list) {
            const out_puts = child.outputs;
            for (const out_put of out_puts) {
              if (convertToArray[out_put.addresses[0]]) {
                const result = {
                  network: listNetwork.Ethereum,
                  from: "",
                  to: convertToArray[out_put.addresses[0]],
                  symbol: "BTC",
                  value: weiToEther(out_put.value),
                  contractAddress: null,
                  gasPrice: 0,
                  gasUse: weiToEther(`${child.fee}`),
                  blockNumber: child.block_time,
                  transaction_hash: child.hash,
                  category: 0, // 1: send, 0: receive
                  confirmations: 0,
                  cumulativeGasUsed: 0,
                  effectiveGasPrice: 0,
                };
                await new this.modelDeposit({ ...result }).save();
              }
            }
          }
        } catch (error) {
          continue;
        }

        await sleep(5000);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
