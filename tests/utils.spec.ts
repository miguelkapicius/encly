import { generateExpiresAt } from "../src/utils/date.ts";
import { generateShortCode } from "../src/utils/url-shortener.ts";

describe("generateShortCode", () => {
  it("should generate a shortCode with 10 characters by default", () => {
    const code = generateShortCode();
    expect(code).toHaveLength(10);
  });

  it("should generate a shortCode with the specified length", () => {
    const code = generateShortCode(5);
    expect(code).toHaveLength(5);
  });

  it("should generate a shortCode using only alphanumeric characters", () => {
    const code = generateShortCode(20);
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("should generate a unique shortCode for each call", () => {
    const code1 = generateShortCode();
    const code2 = generateShortCode();
    expect(code1).not.toBe(code2);
  });
});

describe("generateExpiresAt", () => {
  it("should generate expiresAt with 10 days ago by default", async () => {
    const expiresAt = generateExpiresAt();
    const now = new Date();
    const expected = new Date(now);
    expected.setDate(now.getDate() + 10);

    expect(expiresAt.getTime()).toBe(expected.getTime());
  });

  it("should generate expiresAt with custom 5 days ago", async () => {
    const expiresAt = generateExpiresAt(5);
    const now = new Date();
    const expected = new Date(now);
    expected.setDate(now.getDate() + 5);

    expect(expiresAt.getTime()).toBe(expected.getTime());
  });
});
