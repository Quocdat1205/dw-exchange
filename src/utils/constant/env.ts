import * as dotenv from "dotenv";
dotenv.config();

const env: { [key: string]: any } = {};

define("NODE_ENV", process.env.NODE_ENV);
define("PORT", process.env.PORT);
define("isProduction", process.env.NODE_ENV === "production");
define("MONGO_URL", process.env.MONGO_URL);
define("ETHEREUM_RCP", process.env.ETHEREUM_RCP);
define("ENABLE_DEPOSIT_WITHDRAW", process.env.ENABLE_DEPOSIT_WITHDRAW);

function define(key: string, value: any) {
  Object.defineProperty(env, key, {
    value,
    enumerable: true,
  });
}

export default env;
