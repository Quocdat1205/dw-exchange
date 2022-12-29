import BN from "bn.js";

export interface AccountInterface {
  address: string;
  privateKey: string;
  signTransaction: (
    transactionConfig: TransactionConfig,
    callback?: (signTransaction: SignedTransaction) => void,
  ) => Promise<SignedTransaction>;
  sign: (data: string) => Sign;
  encrypt: (password: string) => EncryptedKeystoreV3Json;
}

export interface TransactionConfig {
  from?: string | number;
  to?: string;
  value?: number | string | BN;
  gas?: number | string;
  gasPrice?: number | string | BN;
  maxPriorityFeePerGas?: number | string | BN;
  maxFeePerGas?: number | string | BN;
  data?: string;
  nonce?: number;
  chainId?: number;
  common?: Common;
  chain?: string;
  hardfork?: string;
}

export interface SignedTransaction {
  messageHash?: string;
  r: string;
  s: string;
  v: string;
  rawTransaction?: string;
  transactionHash?: string;
}

export interface Sign extends SignedTransaction {
  message: string;
  signature: string;
}

export interface EncryptedKeystoreV3Json {
  version: number;
  id: string;
  address: string;
  crypto: {
    ciphertext: string;
    cipherparams: { iv: string };
    cipher: string;
    kdf: string;
    kdfparams: {
      dklen: number;
      salt: string;
      n: number;
      r: number;
      p: number;
    };
    mac: string;
  };
}

export interface Common {
  customChain: CustomChainParams;
  baseChain?: chain;
  hardfork?: hardfork;
}

export interface CustomChainParams {
  name?: string;
  networkId: number;
  chainId: number;
}

export type chain = "mainnet" | "goerli" | "kovan" | "rinkeby" | "ropsten";

export type hardfork =
  | "chainstart"
  | "homestead"
  | "dao"
  | "tangerineWhistle"
  | "spuriousDragon"
  | "byzantium"
  | "constantinople"
  | "petersburg"
  | "istanbul";
