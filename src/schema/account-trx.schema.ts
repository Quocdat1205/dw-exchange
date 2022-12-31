import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AccountTrxType = AccountTrx & Document;

@Schema()
export class AccountTrx {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  privateKey: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  hex: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const AccountTrxSchema = SchemaFactory.createForClass(AccountTrx);
