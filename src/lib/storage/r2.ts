import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

interface R2Config {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucketName: string;
  publicUrl: string;
}

interface UploadBufferToR2Options {
  buffer: Buffer | Uint8Array;
  contentType: string;
  extension: string;
  prefix: string;
  cacheControl?: string;
}

export interface R2UploadResult {
  key: string;
  url: string;
}

export class R2ConfigurationError extends Error {
  constructor(missingKeys: string[]) {
    super(`Missing required R2 environment variables: ${missingKeys.join(", ")}`);
    this.name = "R2ConfigurationError";
  }
}

let r2Client: S3Client | null = null;

function getR2Config(): R2Config {
  const config = {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    endpoint: process.env.R2_ENDPOINT,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
  };

  const envEntries: Array<[string, string | undefined]> = [
    ["R2_ACCESS_KEY_ID", config.accessKeyId],
    ["R2_SECRET_ACCESS_KEY", config.secretAccessKey],
    ["R2_ENDPOINT", config.endpoint],
    ["R2_BUCKET_NAME", config.bucketName],
    ["R2_PUBLIC_URL", config.publicUrl],
  ];

  const missingKeys = envEntries
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new R2ConfigurationError(missingKeys);
  }

  return config as R2Config;
}

function getR2Client(config: R2Config): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return r2Client;
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function buildObjectKey(prefix: string, extension: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safePrefix = trimSlashes(prefix);
  const safeExtension = extension.replace(/^\.+/, "");

  return `${safePrefix}/${year}/${month}/${randomUUID()}.${safeExtension}`;
}

function buildPublicUrl(publicUrl: string, key: string): string {
  return `${publicUrl.replace(/\/+$/g, "")}/${key}`;
}

export async function uploadBufferToR2(
  options: UploadBufferToR2Options
): Promise<R2UploadResult> {
  const config = getR2Config();
  const key = buildObjectKey(options.prefix, options.extension);

  await getR2Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: options.buffer,
      ContentType: options.contentType,
      CacheControl:
        options.cacheControl ?? "public, max-age=31536000, immutable",
    })
  );

  return {
    key,
    url: buildPublicUrl(config.publicUrl, key),
  };
}
