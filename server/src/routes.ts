import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { clicksTable, linksTable } from "./db/schema.ts";
import { generateShortCode } from "./utils/url-shortener.ts";
import { eq } from "drizzle-orm";
import { env } from "./env.ts";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { generateExpiresAt } from "./utils/date.ts";

export const routes =
  (
    db: NodePgDatabase<Record<string, never>> & {
      $client: Pool;
    }
  ): FastifyPluginCallbackZod =>
  (app) => {
    app.get(
      "/health",
      {
        schema: {
          tags: ["Health"],
          description: "API Health Check",
          response: {
            200: z.object({
              status: z.string().default("OK"),
            }),
          },
        },
      },
      (request, reply) => {
        reply.status(200).send({
          status: "OK",
        });
      }
    );

    app.get(
      "/links",
      {
        schema: {
          tags: ["URL"],
          response: {
            200: z.array(
              z.object({
                id: z.string(),
                shortUrl: z.string(),
                originalUrl: z.string(),
                createdAt: z.date(),
                expiresAt: z.date().nullable(),
                clickCount: z.number().nullable(),
                lastAccessed: z.date().nullable(),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const links = await db
          .select()
          .from(linksTable)
          .orderBy(linksTable.createdAt);

        reply.status(200).send(
          links.map((link) => ({
            id: link.id,
            shortUrl: `${env.BASE_URL}/${link.shortCode}`,
            originalUrl: link.originalUrl,
            createdAt: link.createdAt,
            expiresAt: link.expiresAt,
            clickCount: link.clickCount,
            lastAccessed: link.lastAccessed,
          }))
        );
      }
    );

    app.get(
      "/:shortCode",
      {
        schema: {
          tags: ["Redirect"],
          params: z.object({
            shortCode: z.string().length(6, "Invalid link."),
          }),
          response: {
            400: z.object({
              message: z.string().default("Invalid link."),
            }),
            404: z.object({
              message: z.string().default("Link not found."),
            }),
            410: z.object({
              message: z.string().default("Expired link."),
            }),
            302: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { shortCode } = request.params;

        const links = await db
          .select()
          .from(linksTable)
          .where(eq(linksTable.shortCode, shortCode))
          .limit(1);

        const link = links[0];

        if (!link) {
          reply.status(404).send({
            message: "Link not found.",
          });
        }

        if (link.expiresAt && link.expiresAt < new Date()) {
          return reply.status(410).send({
            message: "Expired link.",
          });
        }

        await db
          .update(linksTable)
          .set({
            clickCount: link.clickCount! + 1,
            lastAccessed: new Date(),
          })
          .where(eq(linksTable.id, link.id));

        await db.insert(clicksTable).values({
          shortCode: link.shortCode,
          ip: request.ip,
          userAgent: request.headers["user-agent"] || null,
        });

        reply.status(302).redirect(link.originalUrl);
      }
    );

    app.post(
      "/links",
      {
        schema: {
          tags: ["URL"],
          description: "Create a short URL",
          body: z.object({
            url: z.url(),
          }),
          response: {
            201: z.object({
              original_url: z.string(),
              short_url: z.string(),
              expires_at: z.date(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { url } = request.body;

        let shortCode = generateShortCode();

        const expiresAt = generateExpiresAt(10); // 10 days

        await db
          .insert(linksTable)
          .values({
            originalUrl: url,
            shortCode,
            expiresAt,
          })
          .returning();

        reply.status(201).send({
          original_url: url,
          short_url: `${env.BASE_URL}/${shortCode}`,
          expires_at: expiresAt,
        });
      }
    );
  };
