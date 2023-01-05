import { BigNumber, BigNumberish, ethers } from "ethers";
import { listNetwork } from "@utils/constant/network";
import Web3 from "web3";
import { validate, Network } from "bitcoin-address-validation";
import Sdk from "api";
import env from "@utils/constant/env";

export const etherToWei = (amount: number | string): BigNumber =>
  ethers.utils.parseEther(amount.toString());

export const formatUnits = (
  value: BigNumberish,
  unitName?: string | BigNumberish,
) => parseFloat(ethers.utils.formatUnits(value, unitName));

export const parseUnit = (amount: string, unit?: BigNumberish): BigNumber =>
  ethers.utils.parseUnits(amount, unit);

export const weiToEther = (wei: string | BigNumber): number =>
  parseFloat(ethers.utils.formatEther(wei));

export const isAddressValid = async (address: string, network: listNetwork) => {
  if (network === listNetwork.Ethereum || network === listNetwork.Bsc) {
    return Web3.utils.isAddress(address);
  }

  if (network === listNetwork.Bitcoin) {
    return validate(
      address,
      env.NODE_ENV !== "production" ? Network.testnet : Network.mainnet,
    );
  }

  // validate tron network
  const sdk = Sdk("@tron/v4.6.0#36xrk2lbg6wico");
  const { data } = await sdk.validateaddress({
    address,
  });

  return data.result;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const checkObject = (obj: { [key: string]: any }) => {
  const check = Object.keys(obj).length;

  if (check === 0) {
    return false;
  }

  return true;
};
