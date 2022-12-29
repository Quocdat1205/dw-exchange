import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AccountType = Account & Document;

@Schema()
export class Account {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  privateKey: string;

  @Prop({ required: true })
  version: number;

  @Prop({ required: true })
  ciphertext: string;

  @Prop({ required: true })
  cipherparams: string; // json stringify

  @Prop({ required: true })
  cipher: string;

  @Prop({ required: true })
  kdf: string;

  @Prop({ required: true })
  kdfparams: string; // json stringify

  @Prop({ required: true })
  mac: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
