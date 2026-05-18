import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  type GetObjectCommandInput,
} from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION ?? "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET = process.env.AWS_S3_BUCKET_NAME ?? "docuflow";

export async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
  }
}

export async function getObject(
  fileKey: string,
  range?: string
): Promise<{ body: unknown; contentType: string; contentLength?: number; contentRange?: string }> {
  const params: GetObjectCommandInput = { Bucket: BUCKET, Key: fileKey };
  if (range) params.Range = range;

  const res = await s3.send(new GetObjectCommand(params));
  return {
    body: res.Body,
    contentType: res.ContentType ?? "application/pdf",
    contentLength: res.ContentLength,
    contentRange: res.ContentRange,
  };
}

export async function putObject(
  fileKey: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: fileKey, Body: body, ContentType: contentType })
  );
}
