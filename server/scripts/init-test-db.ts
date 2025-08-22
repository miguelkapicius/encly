import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "../src/env.ts";

async function initTestDatabase() {
  console.log("Initializing test database...");

  // Create a connection to the test database
  const testPool = new Pool({ connectionString: env.DATABASE_URL_TEST });
  const testDb = drizzle(testPool, { casing: "snake_case" });

  try {
    // Run migrations on the test database
    await migrate(testDb, { migrationsFolder: "./drizzle" });
    console.log("Test database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize test database:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await testPool.end();
  }
}

// Run the initialization
initTestDatabase().catch(console.error);
