import { NextResponse } from "next/server";
import { getSessionUser, canUpdate } from "@/lib/auth";
import { ddbDocClient, TABLE_NAME } from "@/lib/db";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user || !canUpdate(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!ddbDocClient) {
      return NextResponse.json(
        { error: "DynamoDB client is not configured or enabled in this environment." },
        { status: 400 }
      );
    }

    const seedMap = require("@/content/media-placements.seed.json");
    const keys = Object.keys(seedMap).filter((k) => k.startsWith("MEDIA_PLACEMENT:"));

    const batchSize = 25;
    const chunks: string[][] = [];
    for (let i = 0; i < keys.length; i += batchSize) {
      chunks.push(keys.slice(i, i + batchSize));
    }

    let successCount = 0;
    for (const chunk of chunks) {
      const putRequests = chunk.map((key) => {
        const parts = key.split(":");
        const pk = parts[0];
        const sk = parts.slice(1).join(":");
        const data = seedMap[key];

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
        await ddbDocClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [TABLE_NAME]: putRequests,
            },
          })
        );
        successCount += chunk.length;
      } catch (err: any) {
        console.warn(`[Sync-DynamoDB Batch Error]:`, err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${successCount} / ${keys.length} media placements to DynamoDB table ${TABLE_NAME}.`,
      totalSynced: successCount,
    });
  } catch (err: any) {
    console.error("[Sync-DynamoDB Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error syncing media to DynamoDB." },
      { status: 500 }
    );
  }
}
