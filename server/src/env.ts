import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  BASE_URL: z.string(),
  DATABASE_URL: z.string(),
  DATABASE_URL_TEST: z.string(),
  NODE_ENV: z.string().optional(),
});

export const env = envSchema.parse(process.env);
