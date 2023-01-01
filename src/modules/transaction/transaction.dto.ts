import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsPositive, IsString } from "class-validator";
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
    title: "Wallet address withdraw",
    description: "Wallet address withdraw",
    default: "bc1qafa2rral557kn5n792f4v0s7s5u5u58aj5dz48",
  })
  @IsString()
  to: string;

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
    title: "Amount token",
    description: "Amount tokne",
    example: 0.0001,
  })
  @Transform(({ value }) => Transformation.checkPositive(value))
  @IsPositive()
  amount: number;
}
