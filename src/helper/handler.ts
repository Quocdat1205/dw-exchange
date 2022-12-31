import { BigNumber, ethers } from "ethers";
import { listNetwork } from "@utils/constant/network";
import Web3 from "web3";
import { validate, Network } from "bitcoin-address-validation";
import Sdk from "api";

export const etherToWei = (amount: number | string): BigNumber =>
  ethers.utils.parseEther(amount.toString());

export const weiToEther = (wei: string | BigNumber): number =>
  parseFloat(ethers.utils.formatEther(wei));

export const isAddressValid = async (address: string, network: listNetwork) => {
  if (network === listNetwork.Ethereum || network === listNetwork.Bsc) {
    return Web3.utils.isAddress(address);
  }

  if (network === listNetwork.Bitcoin) {
    return validate(address, Network.mainnet);
  }

  // validate tron network
  const sdk = Sdk("@tron/v4.6.0#36xrk2lbg6wico");
  const { data } = await sdk.validateaddress({
    address,
  });

  console.log(data);
  return data.result;
};
