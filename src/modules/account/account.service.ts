import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import Web3API from "web3";
import env from "@utils/constant/env";
import { Account, AccountType } from "@schema";
import { ResponseCreateAccountDto } from "./account.dto";

@Injectable()
export class WalletService {
  private web3: Web3API;
  constructor(
    @InjectModel(Account.name)
    private readonly modelAccount: Model<AccountType>,
  ) {
    this.web3 = new Web3API(
      new Web3API.providers.HttpProvider(env.ETHEREUM_RCP),
    );
  }
  public async createNewWallet(): Promise<ResponseCreateAccountDto> {
    try {
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

      await new this.modelAccount({
        ...newAccount,
      }).save();

      return { address: account.address };
    } catch (error) {
      console.error(error);
    }
  }
}
