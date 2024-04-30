import 'dotenv/config';
import * as Joi from 'joi';

interface EnvVars {
  NATS_SERVER_URL: string;
  JWT_SECRET: string;
}

const envVarsSchema: Joi.ObjectSchema = Joi.object({
  NATS_SERVER_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
}).unknown(true);

const { error, value } = envVarsSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  NATS_SERVER_URL: envVars.NATS_SERVER_URL,
  JWT_SECRET: envVars.JWT_SECRET,
};
