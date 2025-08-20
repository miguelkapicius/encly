import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { routes } from "./routes.ts";
import type { Pool } from "pg";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "./db/client.ts";

export function buildApp(
  db: NodePgDatabase<Record<string, never>> & {
    $client: Pool;
  }
) {
  const app = fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyCors, { origin: "*" });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Encly URL API",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  app.register(routes(db));

  return app;
}

const app = buildApp(db);
app.listen({ port: 3333 });
