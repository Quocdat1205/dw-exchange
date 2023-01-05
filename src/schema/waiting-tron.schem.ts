import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WaitingTronType = WaitingTron & Document;

@Schema()
export class WaitingTron {
  @Prop({ required: true })
  transaction_hash: string;

  @Prop({ required: false, default: false })
  isTracker: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const WaitingTronSchema = SchemaFactory.createForClass(WaitingTron);
