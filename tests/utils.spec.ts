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
