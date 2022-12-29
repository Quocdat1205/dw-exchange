import { ApiProperty } from "@nestjs/swagger";

export class ResponseCreateAccountDto {
  @ApiProperty({
    type: String,
    name: "Wallet address user",
    description: "Wallet address onchain",
  })
  address: string;
}
