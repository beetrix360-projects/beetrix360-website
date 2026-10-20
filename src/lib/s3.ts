import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

/**
 * Dynamically resolves S3 configuration and client on each request
 */
function getS3Context() {
  const region =
    process.env.S3_REGION ||
    process.env.DDB_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    "us-east-1";

  const bucket =
    process.env.S3_MEDIA_BUCKET ||
    process.env.AWS_S3_BUCKET ||
    process.env.S3_BUCKET_NAME ||
    "";

  const accessKeyId =
    process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  const hasExplicitCreds = !!(accessKeyId && secretAccessKey);
  const isCloudEnv = !!process.env.AWS_EXECUTION_ENV || process.env.NODE_ENV === "production";

  const client = bucket
    ? new S3Client({
        region,
        credentials: hasExplicitCreds
          ? {
              accessKeyId: accessKeyId!,
              secretAccessKey: secretAccessKey!,
            }
          : undefined, // Uses Amplify IAM Service Role automatically
      })
    : null;

  return { region, bucket, client, isCloudEnv };
}

function getBaseUrl(bucket: string, region: string): string {
  if (process.env.NEXT_PUBLIC_CDN_URL) {
    return process.env.NEXT_PUBLIC_CDN_URL.replace(/\/$/, "");
  }
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export interface UploadResult {
  url: string;
  key: string;
  storage: "s3" | "local";
}

/**
 * Uploads a file buffer to S3 (or falls back to public/uploads in local development only).
 */
export async function uploadMedia(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<UploadResult> {
  const { region, bucket, client, isCloudEnv } = getS3Context();

  // Sanitize filename and create unique timestamped name
  const ext = path.extname(originalFilename).toLowerCase() || ".png";
  const baseName = path
    .basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .substring(0, 40);
  const uniqueKey = `uploads/${Date.now()}-${baseName}${ext}`;

  // 1. If S3 bucket is configured, upload to AWS S3
  if (client && bucket) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: uniqueKey,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const url = `${getBaseUrl(bucket, region)}/${uniqueKey}`;
      return { url, key: uniqueKey, storage: "s3" };
    } catch (err: any) {
      console.error("[S3 Upload Error]:", err);
      throw new Error(`S3 upload to bucket '${bucket}' failed: ${err?.message || "Unknown error"}`);
    }
  }

  // 2. In AWS Cloud/Amplify, local filesystem is read-only. We must require S3.
  if (isCloudEnv) {
    throw new Error(
      "S3_MEDIA_BUCKET environment variable is missing on AWS Amplify. Please ensure S3_MEDIA_BUCKET is saved in Amplify Console and redeploy your app."
    );
  }

  // 3. Local development fallback (runs only when testing locally on your PC)
  const localUploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }

  const localFileName = `${Date.now()}-${baseName}${ext}`;
  const localFilePath = path.join(localUploadsDir, localFileName);
  fs.writeFileSync(localFilePath, buffer);

  return {
    url: `/uploads/${localFileName}`,
    key: localFileName,
    storage: "local",
  };
}

/**
 * Deletes media from S3 if configured
 */
export async function deleteMedia(keyOrUrl: string): Promise<void> {
  const { bucket, client } = getS3Context();
  if (!client || !bucket) return;

  try {
    let key = keyOrUrl;
    if (keyOrUrl.startsWith("http")) {
      const parsed = new URL(keyOrUrl);
      key = parsed.pathname.replace(/^\/+/, "");
    }

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    console.warn(`[S3 Delete Error for ${keyOrUrl}]:`, err);
  }
}
