import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { listNetwork, state_transfer } from "@utils/constant/network";

export type WithDrawType = WithDraw & Document;

@Schema()
export class WithDraw {
  @Prop({ required: true, enum: listNetwork, default: listNetwork.Bitcoin })
  network: listNetwork;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: false, default: 1 })
  category: number;

  @Prop({ required: false })
  contractAddress: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: false, default: 0 })
  gasPrice: number;

  @Prop({ required: true })
  gasUse: number;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  transaction_hash: string;

  @Prop({ required: false })
  confirmations: number;

  @Prop({ required: false, default: 0 })
  cumulativeGasUsed: number;

  @Prop({ required: false, default: 0 })
  effectiveGasPrice: number;

  @Prop({ required: false, default: state_transfer.success })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const WithDrawSchema = SchemaFactory.createForClass(WithDraw);
