import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../env.ts";
import { Pool } from "pg";

const pool = new Pool({ connectionString: env.DATABASE_URL_DEV });
export const db = drizzle(pool, {
  casing: "snake_case",
});
