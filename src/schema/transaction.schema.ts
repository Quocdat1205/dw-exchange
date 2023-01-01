import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { listNetwork } from "@utils/constant/network";
import { Document } from "mongoose";

export type TransactionHistoryType = TransactionHistory & Document;

@Schema()
export class TransactionHistory {
  @Prop({ required: true })
  network: listNetwork;

  @Prop({ required: true })
  transactionHash: string;

  @Prop({ required: false })
  value: number;

  @Prop({ required: false })
  to: string;

  @Prop({ required: false })
  tokne: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const NetworkSchema = SchemaFactory.createForClass(TransactionHistory);
