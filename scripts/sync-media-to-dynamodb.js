// Synchronizes all 4,609 media placements from media-placements.seed.json into AWS DynamoDB
const path = require("path");
const fs = require("fs");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, BatchWriteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const region =
  process.env.DDB_REGION ||
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  "us-east-1";

const accessKeyId =
  process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const hasExplicitCreds = !!(accessKeyId && secretAccessKey);
const tableName = process.env.DYNAMODB_CONTENT_TABLE || "Beetrix_Content";

console.log("=== Beetrix360 DynamoDB Media Placements Sync ===");
console.log(`Region: ${region}`);
console.log(`Table: ${tableName}`);
console.log(`Has explicit credentials: ${hasExplicitCreds}`);

const rawClient = new DynamoDBClient({
  region,
  credentials: hasExplicitCreds
    ? {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      }
    : undefined, // Uses IAM Role (Amplify Compute Role)
});

const ddb = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true },
});

async function syncToDynamoDb() {
  const seedPath = path.resolve(__dirname, "../src/content/media-placements.seed.json");
  if (!fs.existsSync(seedPath)) {
    console.error(`Seed file not found at: ${seedPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, "utf-8");
  const seed = JSON.parse(raw);
  const keys = Object.keys(seed).filter((k) => k.startsWith("MEDIA_PLACEMENT:"));
  console.log(`Found ${keys.length} media placements in seed file.`);

  // Chunk into batches of 25 (AWS DynamoDB batch limit)
  const batchSize = 25;
  const chunks = [];
  for (let i = 0; i < keys.length; i += batchSize) {
    chunks.push(keys.slice(i, i + batchSize));
  }

  console.log(`Total batches to write: ${chunks.length}`);
  let successCount = 0;
  let batchIndex = 0;

  for (const chunk of chunks) {
    batchIndex++;
    const putRequests = chunk.map((key) => {
      const parts = key.split(":");
      const pk = parts[0];
      const sk = parts.slice(1).join(":");
      const data = seed[key];

      return {
        PutRequest: {
          Item: {
            pk,
            sk,
            data,
            updatedAt: data.updatedAt || new Date().toISOString(),
          },
        },
      };
    });

    try {
      await ddb.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: putRequests,
          },
        })
      );
      successCount += chunk.length;
      if (batchIndex % 20 === 0 || batchIndex === chunks.length) {
        console.log(`  -> Progress: ${successCount} / ${keys.length} items written (${batchIndex}/${chunks.length} batches)...`);
      }
    } catch (err) {
      console.error(`Error writing batch ${batchIndex}:`, err.message);
      // Wait 1 second and retry once
      await new Promise((r) => setTimeout(r, 1000));
      try {
        await ddb.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: putRequests,
            },
          })
        );
        successCount += chunk.length;
        console.log(`  -> Batch ${batchIndex} retry succeeded.`);
      } catch (retryErr) {
        console.error(`  -> Batch ${batchIndex} retry failed:`, retryErr.message);
      }
    }
  }

  console.log(`\nCompleted! Successfully synced ${successCount} media placements to DynamoDB table [${tableName}].`);
}

syncToDynamoDb().catch((err) => {
  console.error("Fatal sync error:", err);
  process.exit(1);
});

