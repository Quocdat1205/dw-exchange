import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import web3 from "web3";
import env from "@utils/constant/env";
import {
  WithDraw,
  WithDrawType,
  BitcoinTracker,
  BitcoinTrackerType,
  Deposit,
  DepositType,
  WaitingTron,
  WaitingTronType,
} from "@schema";
import { GetTransactionHistoryDto, WithDrawTokenDto } from "./transaction.dto";
import { listNetwork } from "@utils/constant/network";
import { etherToWei, isAddressValid, parseUnit } from "src/helper/handler";
import { Exception } from "@config/exception.config";
import { RESPONSE_CODE, RESPONSE_MSG } from "@utils/constant/response-code";
import { BscService } from "@modules/bsc/bsc.service";
import CryptoAccount from "send-crypto";
import TronWeb from "tronweb";
import { ERC20_ABI } from "@utils/abi/ERC20_ABI";
import { weiToEther } from "src/helper/handler";
import { LoggerService } from "@modules/logger/logger.service";
import { ethers } from "ethers";

// https://mainnet.infura.io/v3/f87b967bc65a41c0a1a25635493fa482
const memo = "transfer";

@Injectable()
export class TransactionService {
  private web3: web3;
  private HttpProvider: any;
  private fullNode: any;
  private solidityNode: any;
  private eventServer: any;
  private contractProvider;
  constructor(
    @InjectModel(WithDraw.name)
    private readonly modelWithdraw: Model<WithDrawType>,
    @InjectModel(BitcoinTracker.name)
    private readonly modelBitcoinTracker: Model<BitcoinTrackerType>,
    @InjectModel(Deposit.name)
    private readonly modelDeposit: Model<DepositType>,
    @InjectModel(WaitingTron.name)
    private readonly modelWaitingTron: Model<WaitingTronType>,
    private readonly bscService: BscService,
  ) {
    this.web3 = new web3(new web3.providers.HttpProvider(env.INFURA_KEY_RCP));
    this.HttpProvider = TronWeb.providers.HttpProvider;
    this.fullNode = new this.HttpProvider(env.TRX_RPC);
    this.solidityNode = new this.HttpProvider(env.TRX_RPC);
    this.eventServer = new this.HttpProvider(env.TRX_RPC);
    this.contractProvider = new ethers.providers.WebSocketProvider(
      "wss://mainnet.infura.io/ws/v3/f87b967bc65a41c0a1a25635493fa482",
    );
  }

  public async sendToken(props: WithDrawTokenDto) {
    const {
      network,
      fromAddress,
      toAddress,
      symbol,
      privateKey,
      amount,
      contractAddress,
    } = props;

    LoggerService.log(`Transfer token`);

    // validate address transfer, receive and network
    const validAddressReceive = await isAddressValid(toAddress, network);
    const validAddressTransfer = await isAddressValid(fromAddress, network);
    if (!validAddressReceive || !validAddressTransfer) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Address receive or send invalid for network",
      });
    }

    if (!contractAddress) {
      const validContractAddress = await isAddressValid(
        contractAddress,
        network,
      );
      if (!validContractAddress)
        return Exception({
          statusCode: RESPONSE_CODE.bad_request,
          message: "Contract address invalid for network",
        });
    }

    // transfer and log
    switch (network) {
      case listNetwork.Ethereum:
        const transferEth = await this.transferEthereum(
          fromAddress,
          toAddress,
          amount,
          privateKey,
          symbol,
          contractAddress,
        );
        return transferEth;
      case listNetwork.Bsc:
        const transferBsc = await this.transferBsc(
          toAddress,
          amount,
          privateKey,
          symbol,
          contractAddress,
        );
        return transferBsc;
      case listNetwork.Bitcoin:
        const transferBtc = await this.transferBtc(
          toAddress,
          amount,
          privateKey,
          symbol,
        );
        return transferBtc;
      case listNetwork.Trx:
        const transferTrx = await this.transferTrx(
          fromAddress,
          toAddress,
          amount,
          privateKey,
          symbol,
          contractAddress,
        );
        return transferTrx;
    }
  }

  private async transferBsc(
    to: string,
    amount: number,
    privateKey: string,
    symbol: string,
    contractAddress: string,
  ) {
    try {
      const connectWallet = this.bscService.createWallet(privateKey);

      if (symbol === "BNB") {
        const balance = weiToEther(await connectWallet.getBalance());

        if (balance < amount) {
          return Exception({
            statusCode: RESPONSE_CODE.bad_request,
            message: RESPONSE_MSG.insufficient,
          });
        }
        const tx = await connectWallet.sendTransaction({
          to,
          value: etherToWei(`${amount}`),
        });

        const wait = await tx.wait();

        const result = {
          network: listNetwork.Bsc,
          from: wait.from,
          to: tx.to,
          symbol: "BNB",
          value: weiToEther(tx.value),
          contractAddress: wait.contractAddress,
          gasPrice: weiToEther(tx.gasPrice),
          gasUse: weiToEther(wait.gasUsed),
          blockNumber: wait.blockNumber,
          transaction_hash: tx.hash,
          category: 1,
          confirmations: wait.confirmations,
          cumulativeGasUsed: weiToEther(wait.cumulativeGasUsed),
          effectiveGasPrice: weiToEther(wait.effectiveGasPrice),
        };

        await new this.modelWithdraw({ ...result }).save();

        return Exception({
          statusCode: RESPONSE_CODE.success,
          message: RESPONSE_MSG.success,
          data: result,
        });
      } else {
        const contract = this.bscService.createContract(
          contractAddress,
          ERC20_ABI,
          connectWallet,
        );
        const symbolContract = await contract.connect(connectWallet).symbol();

        if (symbolContract !== symbol) {
          return Exception({
            statusCode: RESPONSE_CODE.bad_request,
            message: "Symbol does't match with contract",
          });
        }

        const decimals = await contract.connect(connectWallet).decimals();

        const balance = await contract
          .connect(connectWallet)
          .balanceOf(await connectWallet.getAddress());

        if (Number(balance) / 10 ** decimals < amount) {
          return Exception({
            statusCode: RESPONSE_CODE.bad_request,
            message: RESPONSE_MSG.insufficient,
          });
        }

        const tx = await contract
          .connect(connectWallet)
          .transfer(to, amount * 10 ** decimals);

        const wait = await tx.wait();

        const result = {
          network: listNetwork.Bsc,
          from: wait.from,
          to: tx.to,
          symbol: symbol,
          value: weiToEther(tx.value),
          contractAddress: wait.contractAddress,
          gasPrice: weiToEther(tx.gasPrice),
          gasUse: weiToEther(wait.gasUsed),
          blockNumber: wait.blockNumber,
          transaction_hash: tx.hash,
          category: 1,
          confirmations: wait.confirmations,
          cumulativeGasUsed: weiToEther(wait.cumulativeGasUsed),
          effectiveGasPrice: weiToEther(wait.effectiveGasPrice),
        };

        await new this.modelWithdraw({ ...result }).save();

        return Exception({
          statusCode: RESPONSE_CODE.success,
          message: RESPONSE_MSG.success,
          data: tx.hash,
        });
      }
    } catch (error) {
      console.error(error);
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "transfer amount exceeds balance",
      });
    }
  }

  private async transferEthereum(
    fromAddress: string,
    to: string,
    amount: number,
    privateKey: string,
    symbol: string,
    contractAddress: string,
  ) {
    try {
      if (symbol === "ETH") {
        const transaction = await this.web3.eth.accounts.signTransaction(
          {
            to,
            value: `${etherToWei(amount)}`,
            gas: 2000000,
          },
          privateKey,
        );

        const tx = await this.web3.eth.sendSignedTransaction(
          transaction.rawTransaction,
        );

        const result = {
          network: listNetwork.Ethereum,
          from: tx.from,
          to: tx.to,
          symbol: "ETH",
          value: amount,
          contractAddress: tx.contractAddress,
          gasPrice: 0,
          gasUse: tx.gasUsed,
          blockNumber: tx.blockNumber,
          transaction_hash: tx.transactionHash,
          category: 1,
          confirmations: 0,
          cumulativeGasUsed: tx.cumulativeGasUsed,
          effectiveGasPrice: tx.effectiveGasPrice,
        };

        await new this.modelWithdraw({ ...result }).save();

        return Exception({
          statusCode: RESPONSE_CODE.success,
          message: RESPONSE_MSG.success,
          data: tx.transactionHash,
        });
      } else {
        const tokenContract = new ethers.Contract(
          contractAddress,
          ERC20_ABI,
          this.contractProvider,
        );
        const signer = new ethers.Wallet(privateKey, this.contractProvider);
        const symbolContract = await tokenContract.connect(signer).symbol();
        const decimals = await tokenContract.connect(signer).decimals();

        if (symbolContract !== symbol) {
          return Exception({
            statusCode: RESPONSE_CODE.bad_request,
            message: "Symbol does't match with contract",
          });
        }

        const value = parseUnit(`${amount}`, decimals);

        const tx = await tokenContract.connect(signer).transfer(to, value);

        const wait = await tx.wait();

        const result = {
          network: listNetwork.Ethereum,
          from: wait.from,
          to: tx.to,
          symbol: symbol,
          value: amount,
          contractAddress: wait.contractAddress,
          gasPrice: tx.gasPrice ? weiToEther(tx.gasPrice) : 0,
          gasUse: weiToEther(wait.gasUsed),
          blockNumber: wait.blockNumber,
          transaction_hash: tx.hash,
          category: 1,
          confirmations: wait.confirmations,
          cumulativeGasUsed: weiToEther(wait.cumulativeGasUsed),
          effectiveGasPrice: weiToEther(wait.effectiveGasPrice),
        };

        await new this.modelWithdraw({ ...result }).save();

        return Exception({
          statusCode: RESPONSE_CODE.success,
          message: RESPONSE_MSG.success,
          data: tx.hash,
        });
      }
    } catch (error) {
      console.error(error);
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: error.message,
      });
    }
  }

  private async transferBtc(
    to: string,
    amount: number,
    privateKey: string,
    symbol: string,
  ) {
    try {
      if (symbol !== "BTC")
        return Exception({
          statusCode: RESPONSE_CODE.bad_request,
          message:
            "This currency transfer is not supported for the network type",
        });

      const account = new CryptoAccount(privateKey);
      const balance = await account.getBalance("BTC");

      if (balance < amount) {
        return Exception({
          statusCode: RESPONSE_CODE.bad_request,
          message: RESPONSE_MSG.insufficient,
        });
      }

      const tx = await account
        .send(to, amount, "BTC")
        .on("transactionHash", console.log)
        .on("confirmation", console.log);

      await new this.modelBitcoinTracker({
        transactionHash: tx,
      }).save();

      return Exception({
        statusCode: RESPONSE_CODE.success,
        message: RESPONSE_MSG.success,
        data: tx,
      });
    } catch (error) {
      console.log(error);

      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: error.message,
      });
    }
  }

  private async transferTrx(
    from: string,
    to: string,
    amount: number,
    privateKey: string,
    symbol: string,
    contractAddress: string,
  ) {
    try {
      const tronWeb = new TronWeb(
        this.fullNode,
        this.solidityNode,
        this.eventServer,
        privateKey,
      );

      if (symbol === "TRX") {
        // const balance = await tronWeb.trx.getBalance(from);
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

        const result = {
          network: listNetwork.Trx,
          from,
          to,
          symbol: "TRX",
          value: amount,
          contractAddress: null,
          gasPrice: 0,
          gasUse: 0,
          blockNumber: 0,
          transaction_hash: ret.txid,
          category: 1,
          confirmations: 0,
          cumulativeGasUsed: 0,
          effectiveGasPrice: 0,
        };

        await new this.modelWithdraw({ ...result }).save();

        return Exception({
          statusCode: RESPONSE_CODE.success,
          data: {
            message: RESPONSE_MSG.success,
            transactionHash: ret.txid || signedTxn.txID,
          },
        });
      } else {
        const { abi } = await tronWeb.trx.getContract(contractAddress);
        const contract = tronWeb.contract(abi.entrys, contractAddress);
        const decimals = await contract.methods.decimals().call();

        const balance = await contract.methods.balanceOf(from).call();

        if (Number(balance) / 10 ** decimals < amount) {
          return Exception({
            statusCode: RESPONSE_CODE.bad_request,
            message: RESPONSE_MSG.insufficient,
          });
        }

        const tx = await contract.methods
          .transfer(to, amount * 10 ** decimals)
          .send();
        console.log(tx);

        await new this.modelWaitingTron({
          transaction_hash: tx,
        }).save();

        return Exception({
          statusCode: RESPONSE_CODE.success,
          data: {
            message: RESPONSE_MSG.success,
            transactionHash: tx,
          },
        });
      }
    } catch (error) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: RESPONSE_MSG.insufficient,
      });
    }
  }

  public async getTracsactionHitory(props: GetTransactionHistoryDto) {
    const { network, address, limit, category } = props;

    // 1: send, 0: receive
    if (category === 1) {
      const history = await this.modelWithdraw
        .find({
          network,
          to: address,
        })
        .limit(limit);

      return Exception({
        statusCode: RESPONSE_CODE.success,
        data: history,
      });
    }

    const history = await this.modelDeposit
      .find({
        network,
        to: address,
      })
      .limit(limit);

    return Exception({
      statusCode: RESPONSE_CODE.success,
      data: history,
    });
  }
}
