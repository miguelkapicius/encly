export function generateExpiresAt(days: number = 10) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return expiresAt;
}
