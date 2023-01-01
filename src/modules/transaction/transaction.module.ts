import { Module } from "@nestjs/common";
import { LoggerService } from "@modules/logger/logger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import {
  AccountERC20,
  AccountERC20Schema,
  AccountTrx,
  AccountTrxSchema,
  AccountBtc,
  AccountBtcSchema,
  NetWork,
  NetworkSchema,
  TokenConfig,
  TokenConfigSchema,
  AccountAdmin,
  AccountAdminSchema,
  WithDraw,
  WithDrawSchema,
  BitcoinTracker,
  BitcoinTrackerSchema,
} from "@schema";
import { BscService } from "@modules/bsc/bsc.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountERC20.name, schema: AccountERC20Schema },
      { name: AccountTrx.name, schema: AccountTrxSchema },
      { name: AccountBtc.name, schema: AccountBtcSchema },
      { name: NetWork.name, schema: NetworkSchema },
      { name: TokenConfig.name, schema: TokenConfigSchema },
      { name: AccountAdmin.name, schema: AccountAdminSchema },
      { name: WithDraw.name, schema: WithDrawSchema },
      { name: BitcoinTracker.name, schema: BitcoinTrackerSchema },
    ]),
  ],
  controllers: [TransactionController],
  providers: [LoggerService, TransactionService, BscService],
})
export class TransactionModule {}
