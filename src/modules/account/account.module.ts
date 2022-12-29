import { Module } from "@nestjs/common";
import { LoggerService } from "@modules/logger/logger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { WalletService } from "./account.service";
import { WalletController } from "./account.controller";
import { Account, AccountSchema } from "@schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  controllers: [WalletController],
  providers: [LoggerService, WalletService],
})
export class WalletModule {}
