import { BigNumber, ethers } from "ethers";
import { listNetwork } from "@utils/constant/network";
import Web3 from "web3";

export const etherToWei = (amount: number | string): BigNumber =>
  ethers.utils.parseEther(amount.toString());

export const weiToEther = (wei: string | BigNumber): number =>
  parseFloat(ethers.utils.formatEther(wei));

export const isAddressValid = (
  address: listNetwork,
  network: string,
  networkConfig: any,
) => {
  if (network === listNetwork.Ethereum || network === listNetwork.Bsc) {
    return Web3.utils.isAddress(address);
  }

  if (networkConfig && networkConfig.addressRegex) {
    return new RegExp(networkConfig.addressRegex).test(address);
  }
};
