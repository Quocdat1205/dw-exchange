import { Controller, Get, Query } from "@nestjs/common";
import { WalletService } from "./account.service";
import { ApiTags } from "@nestjs/swagger";
import { ROUTER } from "@utils/constant/router";
import { GetInfoTokenBySmartContractDto } from "./account.dto";
import {
  CreateAccountDto,
  CheckValidAddressDto,
  GetBalanceOfDto,
} from "./account.dto";

@ApiTags("Account")
@Controller(ROUTER.ACCOUNT)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(ROUTER.CREATE_ACCOUNT)
  async createAcocunt(@Query() query: CreateAccountDto) {
    return this.walletService.createNewWallet(query);
  }

  @Get(ROUTER.VALID_ADDRESS)
  async validAddress(@Query() query: CheckValidAddressDto) {
    return this.walletService.validAddress(query);
  }

  // @Post(ROUTER.ADD_NEW_NETWORK)
  // async addnewNetwork(@Body() body: DWNetworkDto) {
  //   return this.walletService.addNetwork(body);
  // }

  @Get(ROUTER.GET_BALANCE_OF)
  async getBalance(@Query() query: GetBalanceOfDto) {
    return this.walletService.getBalanceOfToken(query);
  }

  @Get(ROUTER.GET_INFO_BY_SMART_CONTRACT)
  async getInfoTokenBySc(@Query() query: GetInfoTokenBySmartContractDto) {
    return this.walletService.getInfoTokenBySmartcontract(query);
  }
}
