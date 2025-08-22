import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const linksTable = pgTable("links", {
  id: uuid().primaryKey().defaultRandom(),
  shortCode: varchar({ length: 6 }).notNull().unique(),
  originalUrl: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  expiresAt: timestamp(),
  clickCount: integer().default(0),
  lastAccessed: timestamp(),
});

export const clicksTable = pgTable("clicks", {
  id: uuid().primaryKey().defaultRandom(),
  shortCode: varchar({ length: 6 }).notNull(),
  clickedAt: timestamp().defaultNow().notNull(),
  ip: varchar({ length: 45 }),
  userAgent: text(),
});
