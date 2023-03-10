import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsEthereumAddress,
  IsString,
  IsOptional,
} from "class-validator";
import { listNetwork } from "@utils/constant/network";

export class ResponseCreateAccountDto {
  @ApiProperty({
    type: String,
    name: "Wallet address user",
    description: "Wallet address onchain",
    example: "0x8c1d6f34aBEBfEa130419CDd99f5f2fC0eaC4cF1",
  })
  @IsString()
  address: string;

  @ApiProperty({
    type: String,
    name: "Private key for account",
    description: "Private key",
  })
  @IsEthereumAddress()
  privateKey: string;
}

export class CreateAccountDto {
  @ApiProperty({
    type: listNetwork,
    title: "The type of network you want to create an account for",
    description: `Network in [Bitcoin, Ethereum, TRON, BSC]`,
    default: "BSC",
  })
  @IsEnum(listNetwork)
  network: listNetwork;
}

export class CheckValidAddressDto {
  @ApiProperty({
    type: String,
    title: "The type of network you want to create an account for",
    description: `Network in [Bitcoin, Ethereum, TRON, BSC]`,
    default: "BSC",
  })
  @IsEnum(listNetwork)
  network: listNetwork;

  @ApiProperty({
    type: String,
    title: "Contract address",
    description: `Address need check valid`,
    default: "0xc5F6EcaDb23545500300Ed265602736B8C0908e5",
  })
  @IsString()
  address: string;
}

export class DWNetworkDto {
  @ApiProperty({
    type: String,
    title: "The type of network you want to create an account for",
    description: `Network in [Bitcoin, Ethereum, TRON, BSC]`,
    default: "BSC",
  })
  @IsString()
  network: string;

  @ApiProperty({
    type: String,
    title: "Contract address",
    description: `Address need check valid`,
    default: "BNB Smart Chain (BEP20)",
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    title: "Regex validate address",
    description: `regex`,
    default: "^(0x)[0-9A-Fa-f]{40}$",
  })
  @IsString()
  addressRegex: string;

  @ApiProperty({
    type: String,
    title: "Memo regex validate address",
    description: `Memo regex`,
    default: "",
  })
  @IsString()
  memoRegex: string;
}

export class GetBalanceOfDto {
  @ApiProperty({
    type: listNetwork,
    title: "The type of network you want to create an account for",
    description: `Network in [Bitcoin, Ethereum, TRON, BSC]`,
    default: "BSC",
  })
  @IsEnum(listNetwork)
  network: listNetwork;

  @ApiProperty({
    type: String,
    title: "Wallet address your check",
    default: "0xc5F6EcaDb23545500300Ed265602736B8C0908e5",
  })
  @IsString()
  address: string;

  @ApiProperty({
    type: String,
    title: "Token",
    default: "BSC",
    required: false,
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    type: String,
    title: "Contract address token",
    default: "0x55d398326f99059ff775485246999027b3197955",
    required: false,
  })
  @IsOptional()
  contractAddress: string;
}

export class GetInfoTokenBySmartContractDto {
  @ApiProperty({
    type: listNetwork,
    title: "The type of network you want to create an account for",
    description: `Network in [Bitcoin, Ethereum, TRON, BSC]`,
    default: "BSC",
  })
  @IsEnum(listNetwork)
  network: listNetwork;

  @ApiProperty({
    type: String,
    title: "Contract address",
    description: `Contract address in chain [Bitcoin, Ethereum, TRON, BSC]`,
    default: "0x55d398326f99059fF775485246999027B3197955",
    required: false,
  })
  @IsString()
  contractAddress: string;
}
