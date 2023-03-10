import Joi from "joi";

const validationEnv = {
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string().default("develop"),
  INFURA_KEY: Joi.string(),
};

export default validationEnv;
