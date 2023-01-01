import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsPositive,
  IsString,
  IsNumber,
  IsOptional,
} from "class-validator";
import { listNetwork } from "@utils/constant/network";
import { Transform } from "class-transformer";
import { Transformation } from "@utils/pipe/transform.pipe";

export class WithDrawTokenDto {
  @ApiProperty({
    type: String,
    title: "The type of network you want to create an account for",
    description: `Network in [Bitcoin, Ethereum, TRX, BSC]`,
    default: "Bitcoin",
  })
  @IsEnum(listNetwork)
  network: listNetwork;

  @ApiProperty({
    type: String,
    title: "Wallet address transfer",
    description: "Wallet address transfer",
    default: "bc1qafa2rral557kn5n792f4v0s7s5u5u58aj5dz48",
  })
  @IsString()
  fromAddress: string;

  @ApiProperty({
    type: String,
    title: "Wallet address withdraw",
    description: "Wallet address withdraw",
    default: "bc1qafa2rral557kn5n792f4v0s7s5u5u58aj5dz48",
  })
  @IsString()
  toAddress: string;

  @ApiProperty({
    type: String,
    title: "Wallet address withdraw",
    description: "Wallet address withdraw",
    default: "bc1qafa2rral557kn5n792f4v0s7s5u5u58aj5dz48",
  })
  @IsString()
  privateKey: string;

  @ApiProperty({
    type: String,
    title: "Token withdraw",
    description: "Token withdraw",
    example: "USDT",
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    type: Number,
    title: "Amount token transfer",
    description: "Amount tokne",
    example: 0.0001,
  })
  @Transform(({ value }) => Transformation.checkPositive(value))
  @IsPositive()
  amount: number;

  @ApiProperty({
    type: Number,
    title: "Contract address transfer",
    description: "Amount tokne",
    example: "0x55d398326f99059ff775485246999027b3197955",
  })
  @IsOptional()
  contractAddress: string;
}

export class GetTransactionHistoryDto {
  @ApiProperty({
    type: String,
    title: "The type of network you want to create an account for",
    description: `Network in [Bitcoin, Ethereum, TRX, BSC]`,
    default: "Bitcoin",
  })
  @IsEnum(listNetwork)
  network: listNetwork;

  @ApiProperty({
    type: String,
    title: "Address query",
    description: `Address`,
    default: "TSrsPar2bjxSUepC3if4ztRnb7VxsnRNjC",
  })
  @IsString()
  address: string;

  @ApiProperty({
    type: Number,
    title: "Amount transaction",
    default: 5,
  })
  @IsNumber()
  limit: number;

  @ApiProperty({
    type: Number,
    title: "Send or receive",
    description: `null: all, 0: receive, 1: send`,
    default: 1,
  })
  @IsNumber()
  category: number;

  @ApiProperty({
    type: String,
    title: "Contract address for token",
    description: `Contract address`,
    default: "TSrsPar2bjxSUepC3if4ztRnb7VxsnRNjC",
  })
  @IsString()
  contractAddress: string;

  @ApiProperty({
    type: String,
    title: "Symbol",
    description: `Symbol token`,
    default: "BTC",
  })
  @IsString()
  symbol: string;
}
