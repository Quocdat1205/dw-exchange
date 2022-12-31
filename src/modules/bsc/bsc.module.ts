import { Global, Module } from "@nestjs/common";
import { BscService } from "./bsc.service";

@Global()
@Module({
  imports: [BscService],
  exports: [],
  providers: [BscService],
})
export class BscModule {}
