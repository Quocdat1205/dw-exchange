import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AccountAdminType = AccountAdmin & Document;

@Schema()
export class AccountAdmin {
  @Prop({ required: true })
  network: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  isWithdraw: boolean;

  @Prop({ required: true })
  privateKey: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const AccountAdminSchema = SchemaFactory.createForClass(AccountAdmin);
