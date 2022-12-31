import {
  ExternallyOwnedAccount,
  VoidSigner,
} from "@ethersproject/abstract-signer";
import { BytesLike } from "@ethersproject/bytes";
import { ProgressCallback } from "@ethersproject/json-wallets";
import { Provider as AbstractProvider } from "@ethersproject/providers";
import { SigningKey } from "@ethersproject/signing-key";
import { Wallet } from "@ethersproject/wallet";
import { Wordlist } from "@ethersproject/wordlists";
import { RandomWalletOptions } from "./bsc.interface";
import { createBaseProvider } from "./bsc.provider";
import { Injectable } from "@nestjs/common";
import { Contract, ContractInterface } from "ethers";
import env from "@utils/constant/env";

@Injectable()
export class BscService {
  public provider: AbstractProvider;
  public providerOnus: AbstractProvider; // test dw onus chain

  constructor() {
    this.initProvider();
  }

  private async initProvider() {
    const providers = createBaseProvider({
      network: env.BSC_RCP,
      bscscan: "https://bscscan.com/",
    });

    this.provider = providers;
  }

  // connect new contract
  public createContract(
    address: string,
    abi: ContractInterface,
    signer?: Wallet | VoidSigner,
  ): Contract {
    return new Contract(address, abi, signer ?? this.provider);
  }

  // connect wallet
  public createWallet(
    privateKey: BytesLike | ExternallyOwnedAccount | SigningKey,
  ): Wallet {
    return new Wallet(privateKey, this.provider);
  }

  public createRandomWallet(options?: RandomWalletOptions): Wallet {
    const wallet = Wallet.createRandom(options) as Wallet;

    return wallet.connect(this.provider);
  }

  public async createWalletFromEncryptedJson(
    jsonString: string,
    password: BytesLike,
    progressCallback?: ProgressCallback,
  ): Promise<Wallet> {
    const wallet = await Wallet.fromEncryptedJson(
      jsonString,
      password,
      progressCallback,
    );

    return wallet.connect(this.provider);
  }

  public createWalletfromMnemonic(
    mnemonic: string,
    path?: string,
    wordlist?: Wordlist,
  ): Wallet {
    const wallet = Wallet.fromMnemonic(mnemonic, path, wordlist) as Wallet;

    return wallet.connect(this.provider);
  }

  public createVoidSigner(address: string): VoidSigner {
    return new VoidSigner(address, this.provider);
  }
}
