import { Module } from "@nestjs/common";
import { LoggerService } from "@modules/logger/logger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { TrackerService } from "./tracker.service";
import { BscService } from "@modules/bsc/bsc.service";

@Module({
  imports: [MongooseModule.forFeature([])],
  controllers: [],
  providers: [LoggerService, TrackerService, BscService],
})
export class TrackerModule {}
