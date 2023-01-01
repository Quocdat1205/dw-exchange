import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { listNetwork } from "@utils/constant/network";

export type WithDrawType = WithDraw & Document;

@Schema()
export class WithDraw {
  @Prop({ required: true })
  network: listNetwork;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  gasPrice: number;

  @Prop({ required: true })
  gasUse: number;

  @Prop({ required: true })
  transaction_hash: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const WithDrawSchema = SchemaFactory.createForClass(WithDraw);
