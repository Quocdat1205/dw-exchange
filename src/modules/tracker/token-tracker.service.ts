import { Injectable } from "@nestjs/common";
import { Contract, EventFilter } from "ethers";
import { BscService } from "@modules/bsc/bsc.service";
import { ERC20_ABI } from "@utils/abi/ERC20_ABI";
import { Interval } from "@nestjs/schedule";
import { LoggerService } from "@modules/logger/logger.service";
import { InjectModel } from "@nestjs/mongoose";
import {
  AccountERC20,
  AccountERC20Type,
  Deposit,
  DepositType,
  WithDraw,
  WithDrawType,
} from "@schema";
import { Model } from "mongoose";
import {
  contractBbaBsc,
  contractBusdBsc,
  listNetwork,
  state_transfer,
} from "@utils/constant/network";
import { weiToEther } from "src/helper/handler";
import { contractUsdtBsc } from "@utils/constant/network";
import TronWeb from "tronweb";
import env from "@utils/constant/env";
import { sleep } from "src/helper/handler";

const private_key =
  "b8c374866547dfea61b68fdf48d524cc42c84d9379267e87aad7a4e021f75a6b";

@Injectable()
export class TokenTrackerService {
  private HttpProvider: any;
  private fullNode: any;
  private solidityNode: any;
  private eventServer: any;
  private tronWeb: any;

  constructor(
    private readonly bscService: BscService,
    @InjectModel(AccountERC20.name)
    private readonly modelAccountErc20: Model<AccountERC20Type>,
    @InjectModel(Deposit.name)
    private readonly modelDeposit: Model<DepositType>,
    @InjectModel(WithDraw.name)
    private readonly modelWithdraw: Model<WithDrawType>,
  ) {
    this.HttpProvider = TronWeb.providers.HttpProvider;
    this.fullNode = new this.HttpProvider(env.TRX_RPC);
    this.solidityNode = new this.HttpProvider(env.TRX_RPC);
    this.eventServer = new this.HttpProvider(env.TRX_RPC);
    this.tronWeb = new TronWeb(
      this.fullNode,
      this.solidityNode,
      this.eventServer,
      private_key,
    );
  }

  private getTimeBlock = async () => {
    const chainLatestBlock =
      (await this.bscService.provider.getBlockNumber()) - 100;
    const fromBlock = +chainLatestBlock - 300;

    return { chainLatestBlock, fromBlock };
  };

  @Interval("Tracker transfer usdt", 1000 * 60 * 1.75)
  async trackerTransferUsdtBsc() {
    await this.trackerTransfer(
      contractUsdtBsc.contractAddress,
      contractUsdtBsc.symbol,
    );
  }

  @Interval("Tracker transfer busd", 1000 * 60 * 3)
  async trackerTransferBusdBsc() {
    await this.trackerTransfer(
      contractBusdBsc.contractAddress,
      contractBusdBsc.symbol,
    );
  }

  @Interval("Tracker transfer bba", 1000 * 60 * 5)
  async trackerTransferBusdBba() {
    await this.trackerTransfer(
      contractBbaBsc.contractAddress,
      contractBbaBsc.symbol,
    );
  }

  async trackerTransfer(contractAddress: string, symbol: string) {
    LoggerService.log(`Tracker transafer ${symbol}`);
    const contract: Contract = this.bscService.createContract(
      contractAddress,
      ERC20_ABI,
    );
    const event: EventFilter = contract.filters.Transfer();
    const { chainLatestBlock, fromBlock } = await this.getTimeBlock();
    const events = await contract.queryFilter(
      event,
      fromBlock,
      chainLatestBlock,
    );
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

    for (const event of events) {
      try {
        const args = event.args;

        if (args[`to`]) {
          if (convertToArray[args[`to`].toLowerCase()]) {
            const transaction = await event.getTransaction();
            const wait = await transaction.wait();

            const result = {
              network: listNetwork.Bsc,
              from: transaction.from,
              to: transaction.to,
              symbol,
              value: weiToEther(transaction.value),
              contractAddress,
              gasPrice: weiToEther(transaction.gasPrice),
              gasUse: weiToEther(wait.gasUsed),
              blockNumber: transaction.blockNumber,
              transaction_hash: event.transactionHash,
              category: 0, // 1: send, 0: receive
              confirmations: wait.confirmations,
              cumulativeGasUsed: weiToEther(wait.cumulativeGasUsed),
              effectiveGasPrice: weiToEther(wait.effectiveGasPrice),
            };

            await new this.modelDeposit({ ...result }).save();
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  @Interval("Tracker transaction trx peding", 1000 * 60 * 3)
  async trackerTransferTron() {
    LoggerService.log(`Tracker transfer tron pending`);
    const list_tx_waitings = await this.modelWithdraw.find({
      status: state_transfer.pending,
      network: listNetwork.Trx,
    });
    for (const transaction of list_tx_waitings) {
      const tx = await this.tronWeb.trx.getTransactionInfo(
        transaction.transaction_hash,
      );

      transaction.gasUse = tx.fee / 10 ** 6;
      transaction.blockNumber = tx.blockNumber;
      transaction.contractAddress = tx.contract_address;

      await transaction.save();

      await sleep(1000);
    }
  }
}
