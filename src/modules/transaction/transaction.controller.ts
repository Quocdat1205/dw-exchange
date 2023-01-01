import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ROUTER } from "@utils/constant/router";
import { TransactionService } from "./transaction.service";
import { WithDrawTokenDto } from "./transaction.dto";

@ApiTags("Account")
@Controller(ROUTER.TRANSACTION)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post(ROUTER.SEND)
  async withDrawToken(@Body() body: WithDrawTokenDto) {
    return this.transactionService.withDrawToken(body);
  }
}
