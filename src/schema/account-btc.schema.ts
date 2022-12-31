import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AccountBtcType = AccountBtc & Document;

@Schema()
export class AccountBtc {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  privateKey: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const AccountBtcSchema = SchemaFactory.createForClass(AccountBtc);
