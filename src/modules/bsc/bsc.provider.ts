import { EthersModuleOptions } from "./bsc.interface";
import {
  Provider as AbstractProvider,
  BaseProvider,
  getDefaultProvider,
} from "@ethersproject/providers";

export function createBaseProvider(
  options: EthersModuleOptions,
): BaseProvider | AbstractProvider {
  const { network } = options;

  return getDefaultProvider(network);
}
