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
} from "@schema";
import {
  ResponseCreateAccountDto,
  CheckValidAddressDto,
  DWNetworkDto,
} from "./account.dto";
import {
  CreateAccountDto,
  GetBalanceOfDto,
  GetInfoTokenBySmartContractDto,
} from "./account.dto";
import { listNetwork } from "@utils/constant/network";
import TronWeb from "tronweb";
import crypto from "crypto";
import { LoggerService } from "@modules/logger/logger.service";
import CoinKey from "coinkey";
import { isAddressValid } from "src/helper/handler";
import { Exception } from "@config/exception.config";
import { RESPONSE_CODE, RESPONSE_MSG } from "@utils/constant/response-code";
import { ethers } from "ethers";
import { BscService } from "@modules/bsc/bsc.service";
import { ERC20_ABI } from "@utils/abi/ERC20_ABI";
import { weiToEther } from "src/helper/handler";

@Injectable()
export class WalletService {
  private web3: Web3API;
  private tronWeb: any;
  private provider: any;

  private tronProvider: any;
  private fullNode: any;
  private solidityNode: any;
  private eventServer: any;
  private privateKey =
    "3481E79956D4BD95F358AC96D151C976392FC4E3FC132F78A847906DE588C145";
  private tronWebProvider: any;

  constructor(
    @InjectModel(AccountERC20.name)
    private readonly modelAccountEthereum: Model<AccountERC20Type>,
    @InjectModel(AccountTrx.name)
    private readonly modelAccountTrx: Model<AccountTrxType>,
    @InjectModel(AccountBtc.name)
    private readonly modelAccountBtc: Model<AccountBtcType>,
    @InjectModel(NetWork.name)
    private readonly modelNetwork: Model<NetworkType>,
    private readonly bscService: BscService,
  ) {
    this.tronProvider = TronWeb.providers.HttpProvider;
    this.web3 = new Web3API(
      new Web3API.providers.HttpProvider(env.ETHEREUM_RCP),
    );
    this.tronWeb = new TronWeb({
      fullHost: env.TRX_RPC,
    });
    this.fullNode = new this.tronProvider("https://api.trongrid.io");
    this.solidityNode = new this.tronProvider("https://api.trongrid.io");
    this.eventServer = new this.tronProvider("https://api.trongrid.io");
    this.provider = new ethers.providers.WebSocketProvider(`${env.INFURA_KEY}`);
    this.tronWebProvider = new TronWeb(
      this.fullNode,
      this.solidityNode,
      this.eventServer,
      this.privateKey,
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
        case listNetwork.Bsc:
          return await this.createAccountEthereum();
        case listNetwork.Bitcoin:
          return await this.createAccountBitcoin();
        case listNetwork.Trx:
          return await this.createAccountTrx();
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

    return { address: account.address, privateKey: account.privateKey };
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

    return { address: wallet.address.base58, privateKey: wallet.privateKey };
  }

  private async createAccountBitcoin(): Promise<ResponseCreateAccountDto> {
    try {
      const wallet = new CoinKey.createRandom();
      const address = wallet.publicAddress;
      const privateKey = wallet.privateKey.toString("hex");

      await new this.modelAccountBtc({
        address,
        privateKey,
      }).save();

      return { address, privateKey };
    } catch (error) {
      console.log(error);
    }
  }

  public async validAddress(props: CheckValidAddressDto) {
    const { address, network } = props;
    LoggerService.log(`Check valid address`);

    try {
      const isValid = await isAddressValid(address, network);

      return Exception({
        statusCode: RESPONSE_CODE.success,
        message: isValid,
      });
    } catch (error) {
      console.log(error);
      return Exception({
        statusCode: RESPONSE_CODE.success,
        message: RESPONSE_MSG.success,
      });
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
    const { network, address, symbol, contractAddress } = props;
    LoggerService.log(`Get balance token on network: ${network}`);

    const validateAddress = await isAddressValid(address, network);
    if (!validateAddress) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Address invalid",
      });
    }

    switch (network) {
      case listNetwork.Ethereum:
        const balanceEthereum = await this.getBalanceEthereum(
          address,
          contractAddress,
          symbol,
        );

        return balanceEthereum;
      case listNetwork.Bsc:
        const balanceBsc = await this.getBalanceTokenBsc(
          address,
          contractAddress,
          symbol,
        );

        return balanceBsc;
      case listNetwork.Bitcoin:
        const balanceBtc = await this.getBalanceBtc(address);

        return balanceBtc;
      case listNetwork.Trx:
        const balanceTrx = await this.getBalanceTrx(
          address,
          contractAddress,
          symbol,
        );

        return balanceTrx;
    }
  }

  public async getBalanceTrx(
    address: string,
    contractAddress: string,
    symbol: string,
  ) {
    if (symbol === "TRX") {
      const balance = await this.tronWeb.trx.getAccount(address);

      return Exception({
        statusCode: RESPONSE_CODE.success,
        data: { balance: balance.balance / 10 ** 6 || 0 },
      });
    }

    const { abi } = await this.tronWeb.trx.getContract(contractAddress);
    const contract = this.tronWebProvider.contract(abi.entrys, contractAddress);
    const symbolSc = await contract.methods.symbol().call();
    const decimals = await contract.methods.decimals().call();

    if (symbolSc !== symbol) {
      return Exception({
        statusCode: RESPONSE_CODE.success,
        message: "Contract and symbol does't match",
      });
    }

    const balance = await contract.methods.balanceOf(address).call();
    const parse = Number(balance);

    return Exception({
      statusCode: RESPONSE_CODE.success,
      data: { balance: parse / 10 ** decimals || 0 },
    });
  }

  public async getBalanceEthereum(
    address: string,
    contractAddress: string,
    symbol: string,
  ) {
    try {
      if (symbol === "ETH") {
        const balance = await this.provider.getBalance(address);
        const parseBalance = weiToEther(balance);

        return Exception({
          statusCode: RESPONSE_CODE.success,
          data: { balance: parseBalance },
        });
      }

      const tokenContract = new ethers.Contract(
        contractAddress,
        ERC20_ABI,
        this.provider,
      );

      const balance = await tokenContract.callStatic.balanceOf(address);
      const parseBalance = weiToEther(balance);
      console.log(parseBalance);

      return Exception({
        statusCode: RESPONSE_CODE.success,
        data: { balance: parseBalance },
      });
    } catch (error) {
      console.log(error);

      return Exception({
        statusCode: RESPONSE_CODE.success,
        message:
          "The contract address for the network is wrong, please check again",
      });
    }
  }

  public async getBalanceTokenBsc(
    address: string,
    contractAddress: string,
    symbol: string,
  ) {
    try {
      if (symbol === "BNB") {
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
        const balance = await wallet.getBalance();
        const parseBalance = weiToEther(balance);

        return Exception({
          statusCode: RESPONSE_CODE.success,
          data: { balance: parseBalance },
        });
      }

      // connect contract token
      const contract = this.bscService.createContract(
        contractAddress,
        ERC20_ABI,
      );

      // get balance
      const balance = await contract.callStatic.balanceOf(address);
      const parseBalance = weiToEther(balance);

      return Exception({
        statusCode: RESPONSE_CODE.success,
        data: { balance: parseBalance },
      });
    } catch (error) {
      console.log(error);
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        data: { balance: 0 },
        message: "error",
      });
    }
  }

  public async getBalanceBtc(address: string) {
    const url = env.BTC_RCP + address;

    const fetchData = await fetch(url);

    const balance = await fetchData.json();

    return Exception({
      statusCode: RESPONSE_CODE.success,
      data: { balance: balance / 10 ** 8 },
    });
  }

  public async getInfoTokenBySmartcontract(
    props: GetInfoTokenBySmartContractDto,
  ) {
    const { network, contractAddress } = props;
    LoggerService.log(`Get info token by smartcontract: ${network}`);

    const isValid = await isAddressValid(contractAddress, network);

    if (!isValid) {
      return Exception({
        statusCode: RESPONSE_CODE.bad_request,
        message: "Invalid address for network",
      });
    }

    try {
      switch (network) {
        case listNetwork.Ethereum:
          const tokenInfoEthereum = await this.getInfoSmartContractEthereum(
            contractAddress,
          );
          return Exception({
            statusCode: RESPONSE_CODE.success,
            data: tokenInfoEthereum,
          });
        case listNetwork.Bsc:
          const tokenInfoBsc = await this.getInfoSmartContractBsc(
            contractAddress,
          );
          return Exception({
            statusCode: RESPONSE_CODE.success,
            data: tokenInfoBsc,
          });
        case listNetwork.Bitcoin:
          return Exception({
            statusCode: RESPONSE_CODE.success,
            message: "Network does't support smartcontract",
          });
        case listNetwork.Trx:
          const tokenInfoByTron = await this.getInfoSmartContractTron(
            contractAddress,
          );
          return Exception({
            statusCode: RESPONSE_CODE.success,
            data: tokenInfoByTron,
          });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async getInfoSmartContractBsc(contractAddress: string) {
    const contractBsc = this.bscService.createContract(
      contractAddress,
      ERC20_ABI,
    );
    const name = await contractBsc.callStatic.name();
    const symbol = await contractBsc.callStatic.symbol();
    const decimals = await contractBsc.callStatic.decimals();

    const result = {
      contract: contractAddress,
      name: name || "",
      symbol: symbol || "",
      decimals: decimals || 18,
    };

    return result;
  }

  private async getInfoSmartContractEthereum(contractAddress: string) {
    const contractEthereum = new ethers.Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    );

    const name = await contractEthereum.callStatic.name();
    const symbol = await contractEthereum.callStatic.symbol();
    const decimals = await contractEthereum.callStatic.decimals();

    const result = {
      contract: contractAddress,
      name: name || "",
      symbol: symbol || "",
      decimals: decimals || 18,
    };

    return result;
  }

  private async getInfoSmartContractTron(contractAddress: string) {
    const { abi } = await this.tronWeb.trx.getContract(contractAddress);

    const contract = this.tronWebProvider.contract(abi.entrys, contractAddress);

    const name = await contract.methods.name().call();
    const symbol = await contract.methods.symbol().call();
    const decimals = await contract.methods.decimals().call();

    // const balance = await contract.methods
    //   .balanceOf("TSrsPar2bjxSUepC3if4ztRnb7VxsnRNjC")
    //   .call();

    const result = {
      contract: contractAddress,
      name: name || "",
      symbol: symbol || "",
      decimals: decimals || 18,
    };

    return result;
  }
}
