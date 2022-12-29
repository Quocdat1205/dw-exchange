import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NetworkType = NetWork & Document;

@Schema()
export class NetWork {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  network: string;

  @Prop({ required: false })
  addressRegex: string;

  @Prop({ required: false })
  memoRegex: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const NetworkSchema = SchemaFactory.createForClass(NetWork);
