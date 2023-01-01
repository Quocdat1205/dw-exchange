import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ROUTER } from "@utils/constant/router";
import { TransactionService } from "./transaction.service";
import { GetTransactionHistoryDto, WithDrawTokenDto } from "./transaction.dto";

@ApiTags("Transaction")
@Controller(ROUTER.TRANSACTION)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post(ROUTER.HISTORY)
  async getTransactionHistory(@Body() body: GetTransactionHistoryDto) {
    return await this.transactionService.getTracsactionHitory(body);
  }

  @Post(ROUTER.SEND)
  async withDrawToken(@Body() body: WithDrawTokenDto) {
    return this.transactionService.sendToken(body);
  }
}
