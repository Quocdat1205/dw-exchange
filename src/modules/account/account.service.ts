import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import Web3API from "web3";
import env from "@utils/constant/env";
import {
  AccountERC20,
  AccountERC20Type,
  AccountTrx,
  AccountTrxType,
  AccountBtc,
  AccountBtcType,
  NetWork,
  NetworkType,
  TokenConfig,
  TokenConfigType,
} from "@schema";
import {
  ResponseCreateAccountDto,
  CheckValidAddressDto,
  DWNetworkDto,
} from "./account.dto";
import { CreateAccountDto, GetBalanceOfDto } from "./account.dto";
import { listNetwork } from "@utils/constant/network";
import TronWeb from "tronweb";
import crypto from "crypto";
import { LoggerService } from "@modules/logger/logger.service";
import CoinKey from "coinkey";
import { isAddressValid } from "src/helper/handler";
import { Exception } from "@config/exception.config";
import { RESPONSE_CODE, RESPONSE_MSG } from "@utils/constant/response-code";
import Sdk from "api";
import { ethers } from "ethers";
import { BscService } from "@modules/bsc/bsc.service";
import { ERC20_ABI } from "@utils/abi/ERC20_ABI";
import { weiToEther } from "src/helper/handler";

@Injectable()
export class WalletService {
  private web3: Web3API;

  constructor(
    @InjectModel(AccountERC20.name)
    private readonly modelAccountEthereum: Model<AccountERC20Type>,
    @InjectModel(AccountTrx.name)
    private readonly modelAccountTrx: Model<AccountTrxType>,
    @InjectModel(AccountBtc.name)
    private readonly modelAccountBtc: Model<AccountBtcType>,
    @InjectModel(NetWork.name)
    private readonly modelNetwork: Model<NetworkType>,
    @InjectModel(TokenConfig.name)
    private readonly modelToken: Model<TokenConfigType>,
    private readonly bscService: BscService,
  ) {
    this.web3 = new Web3API(
      new Web3API.providers.HttpProvider(env.ETHEREUM_RCP),
    );
  }

  public async createNewWallet(
    networkprops: CreateAccountDto,
  ): Promise<ResponseCreateAccountDto> {
    LoggerService.log(`Create new account wallet`);

    const { network } = networkprops;

    try {
      switch (network) {
        case listNetwork.Ethereum:
          return await this.createAccountEthereum();
          break;
        case listNetwork.Bsc:
          return await this.createAccountEthereum();
          break;
        case listNetwork.Bitcoin:
          return await this.createAccountBitcoin();
          break;
        case listNetwork.Tron:
          return await this.createAccountTrx();
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async createAccountEthereum(): Promise<ResponseCreateAccountDto> {
    const account = this.web3.eth.accounts.create(
      this.web3.utils.randomHex(32),
    );
    const wallet = this.web3.eth.accounts.wallet.add(account);
    const keystore = wallet.encrypt(this.web3.utils.randomHex(32));

    // insert new account
    const newAccount = {
      address: account.address,
      privateKey: account.privateKey,
      version: keystore.version,
      ciphertext: keystore.crypto.ciphertext,
      cipherparams: JSON.stringify(keystore.crypto.cipherparams),
      cipher: keystore.crypto.cipher,
      kdf: keystore.crypto.kdf,
      kdfparams: JSON.stringify(keystore.crypto.kdfparams),
      mac: keystore.crypto.mac,
    };

    await new this.modelAccountEthereum({
      ...newAccount,
    }).save();

    return { address: account.address };
  }

  private async createAccountTrx(): Promise<ResponseCreateAccountDto> {
    const privateKey = crypto.randomBytes(32).toString("hex");
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider(env.TRX_RPC);
    const solidityNode = new HttpProvider(env.TRX_RPC);
    const eventServer = new HttpProvider(env.TRX_RPC);
    const tronWeb = new TronWeb(
      fullNode,
      solidityNode,
      eventServer,
      privateKey,
    );

    const wallet = await tronWeb.createAccount();

    await new this.modelAccountTrx({
      address: wallet.address.base58,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      hex: wallet.address.hex,
    }).save();

    return { address: wallet.base58 };
  }

  private async createAccountBitcoin(): Promise<ResponseCreateAccountDto> {
    try {
      const wallet = new CoinKey.createRandom();
      const address = wallet.publicAddress;
      const privateKey = wallet.privateKey.toString("hex");

      console.log(
        "SAVE BUT DO NOT SHARE THIS:",
        wallet.privateKey.toString("hex"),
      );

      console.log("Address:", wallet.publicAddress);

      await new this.modelAccountBtc({
        address,
        privateKey,
      }).save();

      return { address };
    } catch (error) {
      console.log(error);
    }
  }

  public async validAddress(props: CheckValidAddressDto) {
    const { network, address } = props;

    try {
      const info_network = await this.modelNetwork.findOne({ network }).exec();

      if (!info_network) {
        return Exception({
          statusCode: RESPONSE_CODE.bad_request,
          error: RESPONSE_MSG.bad_request,
          message: "Network not found",
        });
      }

      const isValid = await isAddressValid(address, network);

      return isValid;
    } catch (error) {
      console.log(error);
    }
  }

  public async addNetwork(props: DWNetworkDto) {
    try {
      const { name, network, addressRegex, memoRegex } = props;
      return await new this.modelNetwork({
        name,
        network,
        addressRegex,
        memoRegex,
      }).save();
    } catch (error) {
      console.error(error);
    }
  }

  public async getBalanceOfToken(props: GetBalanceOfDto) {
    const { network, address, symbol } = props;

    switch (network) {
      case listNetwork.Ethereum:
        const balanceEthereum = await this.getBalanceEthereum(address);

        return balanceEthereum;
      case listNetwork.Bsc:
        const balanceBsc = await this.getBalanceTokenBsc(address, symbol);

        return balanceBsc;
      case listNetwork.Bitcoin:
        const balanceBtc = await this.getBalanceBtc(address);

        return balanceBtc;
      case listNetwork.Tron:
        const balanceTrx = await this.createAccountTrx();

        return balanceTrx;
    }
  }

  public async getBalanceTrx(address: string) {
    const sdk = Sdk("@tron/v4.6.0#17d20r2ql9cidams");

    // find address
    const account = await this.modelAccountBtc.findOne({
      address,
    });

    if (!account) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Account not found",
      });
    }

    const balance = await sdk.getTrc20TokenHolderBalances({
      contractAddress: address,
    });

    return Exception({
      statusCode: RESPONSE_CODE.success,
      data: { balance },
    });
  }

  public async getBalanceEthereum(address: string) {
    const provider = new ethers.providers.WebSocketProvider(
      `${env.INFURA_KEY}`,
    );
    const balance = await provider.getBalance(address);
    const parseBalance = ethers.utils.formatEther(balance);

    return Exception({
      statusCode: RESPONSE_CODE.success,
      data: { balance: parseBalance },
    });
  }

  public async getBalanceTokenBsc(address: string, symbol: string) {
    const token = await this.modelToken.findOne({
      network: listNetwork.Bsc,
      symbol: symbol,
    });

    if (!token) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Token does't support",
      });
    }

    // find account
    const account = await this.modelAccountEthereum
      .findOne({
        address,
      })
      .exec();

    if (!account) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Account not found",
      });
    }

    // connect wallet
    const wallet = this.bscService.createWallet(account.privateKey);

    // connect contract token
    const contract = this.bscService.createContract(
      token.contractAddress,
      ERC20_ABI,
      wallet,
    );

    // get balance
    const balance = await contract.connect(wallet).balanceOf(account.address);
    const parseBalance = weiToEther(balance);

    return Exception({
      statusCode: RESPONSE_CODE.success,
      data: { balance: parseBalance },
    });
  }

  public async getBalanceBtc(address: string) {
    // find token
    const token = await this.modelAccountBtc.findOne({
      address,
    });

    if (!token) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Account not found",
      });
    }
    const url = env.BTC_RCP + address;

    const fetchData = await fetch(url);

    const balance = fetchData.json();

    return Exception({
      statusCode: RESPONSE_CODE.success,
      data: { balance },
    });
  }
}
