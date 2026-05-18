import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";
import { getObject } from "../lib/storage.js";
import type { DocumentStatus, ExtractedData, BoundingBox } from "@docuflow/types";

export async function documentRoutes(app: FastifyInstance) {
  app.get("/api/documents", async () => {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, createdAt: true, extractedData: true },
    });
    return docs.map((doc) => ({
      id: doc.id,
      status: doc.status as DocumentStatus,
      createdAt: doc.createdAt.toISOString(),
      extractedData: doc.extractedData as unknown as ExtractedData,
    }));
  });

  app.get<{ Params: { id: string } }>("/api/documents/:id", async (req, reply) => {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) return reply.status(404).send({ error: "Not found" });

    return {
      id: doc.id,
      status: doc.status as DocumentStatus,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      fileUrl: `/api/documents/${doc.id}/pdf`,
      extractedData: doc.extractedData as unknown as ExtractedData,
      boundingBoxes: doc.boundingBoxes as unknown as BoundingBox[],
    };
  });

  app.get<{ Params: { id: string } }>("/api/documents/:id/pdf", async (req, reply) => {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      select: { fileKey: true },
    });
    if (!doc) return reply.status(404).send({ error: "Not found" });

    const range = req.headers.range;
    const { body, contentType, contentLength, contentRange } = await getObject(doc.fileKey, range);

    reply.header("Content-Type", contentType);
    reply.header("Accept-Ranges", "bytes");
    if (contentLength) reply.header("Content-Length", contentLength);
    if (contentRange) {
      reply.header("Content-Range", contentRange);
      reply.status(206);
    }

    return reply.send(body);
  });

  app.patch<{
    Params: { id: string };
    Body: { status: DocumentStatus };
  }>("/api/documents/:id/status", async (req, reply) => {
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      select: { id: true, status: true },
    });
    return { id: doc.id, status: doc.status as DocumentStatus };
  });
}
