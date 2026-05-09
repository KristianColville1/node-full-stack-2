import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  HOST: process.env.HOST ?? "0.0.0.0",
  PORT: Number(process.env.PORT ?? "3000"),
  STORAGE: process.env.STORAGE ?? "memory",
  COOKIE_NAME: process.env.COOKIE_NAME,
  COOKIE_PASSWORD: process.env.COOKIE_PASSWORD,
};
