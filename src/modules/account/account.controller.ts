import { Controller, Get } from "@nestjs/common";
import { WalletService } from "./account.service";
import { ApiTags } from "@nestjs/swagger";
import { ROUTER } from "@utils/constant/router";

@ApiTags("Account")
@Controller(ROUTER.ACCOUNT)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(ROUTER.CREATE_ACCOUNT)
  async createAcocunt() {
    return this.walletService.createNewWallet();
  }
}
