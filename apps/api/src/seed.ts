import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";
import { putObject, ensureBucket } from "./lib/storage.js";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const pdfIdx = args.indexOf("--pdf");
  const dataIdx = args.indexOf("--data");

  if (pdfIdx === -1 || dataIdx === -1) {
    console.error("Usage: pnpm seed --pdf <path-to.pdf> --data <path-to.json>");
    console.error("");
    console.error("JSON format: { \"extractedData\": {...}, \"boundingBoxes\": [...] }");
    process.exit(1);
  }

  const pdfPath = args[pdfIdx + 1];
  const dataPath = args[dataIdx + 1];

  const pdfBuffer = readFileSync(pdfPath);
  const payload = JSON.parse(readFileSync(dataPath, "utf-8")) as {
    extractedData: unknown;
    boundingBoxes: unknown;
  };

  await ensureBucket();

  const fileKey = `documents/${Date.now()}_${path.basename(pdfPath)}`;
  await putObject(fileKey, pdfBuffer, "application/pdf");
  console.log("Uploaded:", fileKey);

  const doc = await prisma.document.create({
    data: {
      fileKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractedData: payload.extractedData as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      boundingBoxes: payload.boundingBoxes as any,
      status: "pending",
    },
  });
  console.log("Document created:", doc.id);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
