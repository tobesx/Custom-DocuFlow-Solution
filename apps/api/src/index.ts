import Fastify from "fastify";
import cors from "@fastify/cors";
import { documentRoutes } from "./routes/documents.js";
import { ensureBucket } from "./lib/storage.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(documentRoutes);

const port = Number(process.env.PORT ?? 3001);

try {
  await ensureBucket();
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
