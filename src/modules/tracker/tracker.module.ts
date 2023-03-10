import { Module } from "@nestjs/common";
import { LoggerService } from "@modules/logger/logger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { TrackerService } from "./tracker.service";
import { BscService } from "@modules/bsc/bsc.service";
import {
  BitcoinTracker,
  BitcoinTrackerSchema,
  Deposit,
  DepositSchema,
  AccountERC20,
  AccountERC20Schema,
  AccountTrx,
  AccountTrxSchema,
  AccountBtc,
  AccountBtcSchema,
  WithDraw,
  WithDrawSchema,
} from "@schema";
import { TokenTrackerService } from "./token-tracker.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BitcoinTracker.name, schema: BitcoinTrackerSchema },
      { name: Deposit.name, schema: DepositSchema },
      { name: AccountERC20.name, schema: AccountERC20Schema },
      { name: AccountTrx.name, schema: AccountTrxSchema },
      { name: AccountBtc.name, schema: AccountBtcSchema },
      { name: WithDraw.name, schema: WithDrawSchema },
    ]),
  ],
  controllers: [],
  providers: [LoggerService, TrackerService, BscService, TokenTrackerService],
})
export class TrackerModule {}
