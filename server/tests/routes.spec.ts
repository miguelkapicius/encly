import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { buildApp } from "../src/server.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../src/env.ts";
import { clicksTable, linksTable } from "../src/db/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";
import {
  clearTestDatabase,
  seedTestDatabase,
  setupTestDatabase,
} from "./setup.ts";
import { generateShortCode } from "../src/utils/url-shortener.ts";

// Create a separate pool for test database operations
const testPool = new Pool({ connectionString: env.DATABASE_URL_TEST });
const testDb = drizzle(testPool, { casing: "snake_case" });
const app = buildApp(testDb);

beforeAll(async () => {
  process.env.NODE_ENV = "test";

  await setupTestDatabase();

  await app.ready();
});

afterAll(async () => {
  await app.close();
  await testPool.end();
  console.log("Test database connection closed");
});

beforeEach(async () => {
  await seedTestDatabase();
});

afterEach(async () => {
  await clearTestDatabase();
});

describe("GET /health", () => {
  it("should return status code 200", async () => {
    const response = await request(app.server).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      status: "OK",
    });
  });
});

describe("GET /links", () => {
  it("should return 200 and a list of all links", async () => {
    const response = await request(app.server).get("/links");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should return an array of links with correct property types", async () => {
    const response = await request(app.server).get("/links");

    const parse = z
      .array(
        z.object({
          id: z.string(),
          shortUrl: z.string(),
          originalUrl: z.string(),
          createdAt: z.string(),
          expiresAt: z.string().nullable(),
          clickCount: z.number().nullable(),
          lastAccessed: z.string().nullable(),
        })
      )
      .parse(response.body);

    expect(Array.isArray(parse)).toBe(true);
  });
});

describe("GET /:shortCode", () => {
  it("should redirect to the original URL with status 302", async () => {
    const res = await request(app.server).get("/test12");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://example.com");
  });

  it("should increment the link’s clickCount by 1 on access", async () => {
    const before = new Date();
    await request(app.server).get("/test12");

    const link = await testDb
      .select()
      .from(linksTable)
      .where(eq(linksTable.shortCode, "test12"))
      .limit(1);

    expect(link[0].clickCount).toBe(1);
    expect(link[0].lastAccessed).toBeInstanceOf(Date);
    expect(link[0].lastAccessed?.getTime()).toBeGreaterThanOrEqual(
      before.getTime()
    );
  });

  it("should log the click in clicksTable with IP and userAgent", async () => {
    const res = await request(app.server).get("/test12");

    const click = await testDb
      .select()
      .from(clicksTable)
      .where(eq(clicksTable.shortCode, "test12"))
      .limit(1);

    console.log(click[0]);

    expect(click[0].shortCode).toBe("test12");
    expect(click[0].ip).not.toBeNull();
    expect(click[0].clickedAt).not.toBeNull();
  });

  it("should return 400 when shortCode is invalid", async () => {
    const res = await request(app.server).get("/testbadrequest");

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: "params/shortCode Invalid link.",
    });
  });

  it("should return 404 when shortCode does not exist", async () => {
    const res = await request(app.server).get("/test65");

    expect(res.status).toBe(404);
  });

  it("should return 410 when the link is expired", async () => {
    const res = await request(app.server).get("/sample");

    expect(res.status).toBe(410);
    expect(res.body).toStrictEqual({
      message: "Expired link.",
    });
  });
});

describe("POST /links", () => {
  it("should return status code 400 when url is invalid", async () => {
    const res = await request(app.server).post("/links").send({
      url: "test",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("body/url Invalid URL");
  });

  it("should return status code 201 and a link item", async () => {
    const res = await request(app.server).post("/links").send({
      url: "https://www.example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.original_url).toBe("https://www.example.com");
    expect(new Date(res.body.expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("should persist the new link in the database", async () => {
    const res = await request(app.server).post("/links").send({
      url: "https://www.example.com",
    });

    const link = await testDb
      .select()
      .from(linksTable)
      .where(eq(linksTable.originalUrl, "https://www.example.com"))
      .limit(1);

    expect(link[0]).not.toBeNull();
  });
});
