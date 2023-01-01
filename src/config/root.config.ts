import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import validationEnv from "./joi.config";
import env from "@utils/constant/env";
import { MongooseModule } from "@nestjs/mongoose";
import { WalletModule } from "@modules/account/account.module";
import { TransactionModule } from "@modules/transaction/transaction.module";

export const RootModule = [
  ConfigModule.forRoot({
    validationSchema: Joi.object({
      validationEnv,
    }),
    isGlobal: true,
  }),
  JwtModule.register({
    secretOrPrivateKey: `${env.JWT_SECRET_KEY || "test"}`,
    signOptions: {
      expiresIn: 1000 * 60 * 60 * 6, // 6 hour,
    },
  }),
  ScheduleModule.forRoot(),
  MongooseModule.forRoot(env.MONGO_URL),
  WalletModule,
  TransactionModule,
];
