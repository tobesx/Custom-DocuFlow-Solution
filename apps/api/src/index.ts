import Fastify from "fastify";
import cors from "@fastify/cors";
import staticPlugin from "@fastify/static";
import { fileURLToPath } from "url";
import path from "path";
import { MOCK_DOCUMENT, MOCK_DOCUMENT_LIST } from "./mock/documents.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

await app.register(staticPlugin, {
  root: path.join(__dirname, "mock/assets"),
  prefix: "/mock/",
});

app.get("/api/documents", async () => {
  return MOCK_DOCUMENT_LIST;
});

app.get<{ Params: { id: string } }>("/api/documents/:id", async () => {
  return MOCK_DOCUMENT;
});

const port = Number(process.env.PORT ?? 3001);

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
