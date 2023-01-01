import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BitcoinTrackerType = BitcoinTracker & Document;

@Schema()
export class BitcoinTracker {
  @Prop({ required: true })
  transactionHash: string;

  @Prop({ required: false, default: false })
  isTracker: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const BitcoinTrackerSchema =
  SchemaFactory.createForClass(BitcoinTracker);
