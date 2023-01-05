import { Module } from "@nestjs/common";
import { LoggerService } from "@modules/logger/logger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { WalletService } from "./account.service";
import { WalletController } from "./account.controller";
import {
  AccountERC20,
  AccountERC20Schema,
  AccountTrx,
  AccountTrxSchema,
  AccountBtc,
  AccountBtcSchema,
  NetWork,
  NetworkSchema,
} from "@schema";
import { BscService } from "@modules/bsc/bsc.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountERC20.name, schema: AccountERC20Schema },
      { name: AccountTrx.name, schema: AccountTrxSchema },
      { name: AccountBtc.name, schema: AccountBtcSchema },
      { name: NetWork.name, schema: NetworkSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [LoggerService, WalletService, BscService],
})
export class WalletModule {}
