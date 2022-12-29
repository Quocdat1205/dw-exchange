import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { listNetwork } from "@utils/constant/network";

export type TokenConfigType = TokenConfig & Document;

@Schema()
export class TokenConfig {
  @Prop({ required: true })
  network: listNetwork;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  depositEnable: boolean;

  @Prop({ default: 0, required: false })
  withdrawMin: number;

  @Prop({ default: 0, required: false })
  withdrawMax: number;

  @Prop({ required: true })
  contractAddress: string;

  @Prop({ required: true })
  decimals: number;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const TokenConfigSchema = SchemaFactory.createForClass(TokenConfig);
