import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { listNetwork } from "@utils/constant/network";

export type WithDrawType = WithDraw & Document;

@Schema()
export class WithDraw {
  @Prop({ required: true })
  network: listNetwork;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  category: number;

  @Prop({ required: false })
  contractAddress: number;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  gasPrice: number;

  @Prop({ required: true })
  gasUse: number;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  transaction_hash: string;

  @Prop({ required: true })
  confirmations: number;

  @Prop({ required: true })
  cumulativeGasUsed: number;

  @Prop({ required: true })
  effectiveGasPrice: number;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const WithDrawSchema = SchemaFactory.createForClass(WithDraw);
