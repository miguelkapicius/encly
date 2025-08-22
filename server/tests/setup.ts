import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "../src/env.ts";
import { clicksTable, linksTable } from "../src/db/schema.ts";

// Create a separate pool for test database operations
const testPool = new Pool({ connectionString: env.DATABASE_URL_TEST });
const testDb = drizzle(testPool, { casing: "snake_case" });

/**
 * Setup the test database by running migrations
 */
export async function setupTestDatabase() {
  console.log("Setting up test database...");

  try {
    // Run migrations on the test database
    await migrate(testDb, { migrationsFolder: "./drizzle" });
    console.log("Test database migrations completed successfully");
  } catch (error) {
    console.error("Failed to run test database migrations:", error);
    throw error;
  }
}

/**
 * Clear all data from the test database tables
 */
export async function clearTestDatabase() {
  console.log("Clearing test database...");

  try {
    // Delete all records from tables in reverse order of dependencies
    await testDb.delete(clicksTable);
    await testDb.delete(linksTable);
    console.log("Test database cleared successfully");
  } catch (error) {
    console.error("Failed to clear test database:", error);
    throw error;
  }
}

/**
 * Close the test database connection
 */
export async function closeTestDatabase() {
  console.log("Closing test database connection...");
  await testPool.end();
}

/**
 * Insert seed data for testing
 */
export async function seedTestDatabase() {
  console.log("Seeding test database with sample data...");

  try {
    // Insert sample links
    await testDb.insert(linksTable).values([
      {
        shortCode: "test12",
        originalUrl: "https://example.com",
        createdAt: new Date(),
      },
      {
        shortCode: "sample",
        originalUrl: "https://test-example.org",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 100),
      },
    ]);

    console.log("Test database seeded successfully");
  } catch (error) {
    console.error("Failed to seed test database:", error);
    throw error;
  }
}
