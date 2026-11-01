import { RAW_REDIRECT_MAP } from "./redirect-map";
import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import path from "path";
import type { PageRecordV2, RedirectRecord, NavigationRecord } from "./types";

// Initialize AWS DynamoDB Document Client
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
const isDynamoDbEnabled = process.env.CONTENT_SOURCE === "dynamodb";

const rawClient =
  hasExplicitCreds || isDynamoDbEnabled || !!process.env.AWS_EXECUTION_ENV
    ? new DynamoDBClient({
        region,
        credentials: hasExplicitCreds
          ? {
              accessKeyId: accessKeyId!,
              secretAccessKey: secretAccessKey!,
            }
          : undefined, // AWS SDK automatically uses IAM Service Role when undefined
      })
    : null;

export const ddbDocClient = rawClient
  ? DynamoDBDocumentClient.from(rawClient, {
      marshallOptions: { removeUndefinedValues: true },
    })
  : null;

export const TABLE_NAME = process.env.DYNAMODB_CONTENT_TABLE || "Beetrix_Content";

/**
 * Local file fallback for seamless local development without requiring AWS setup.
 * Once deployed to AWS Amplify with DYNAMODB_CONTENT_TABLE configured, this automatically uses DynamoDB.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_STORE_FILE = path.join(DATA_DIR, "content-store.json");

function ensureLocalStore(): Record<string, any> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(LOCAL_STORE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_STORE_FILE, "utf-8"));
    } catch {
      // fallback
    }
  }

  // Seed default content from existing src/content
  const seed: Record<string, any> = {};
  try {
    const hp = path.join(process.cwd(), "src/content/homepage.json");
    if (fs.existsSync(hp)) {
      seed["PAGE#home:CONTENT"] = JSON.parse(fs.readFileSync(hp, "utf-8"));
    }
    const ss = path.join(process.cwd(), "src/content/site-structure.json");
    if (fs.existsSync(ss)) {
      seed["SITE#config:STRUCTURE"] = JSON.parse(fs.readFileSync(ss, "utf-8"));
    }
    const site = path.join(process.cwd(), "src/content/site.json");
    if (fs.existsSync(site)) {
      seed["SITE#config:SETTINGS"] = JSON.parse(fs.readFileSync(site, "utf-8"));
    }
    const seedFile = path.join(process.cwd(), "src/content/ia-v2.seed.json");
    if (fs.existsSync(seedFile)) {
      const seedData = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
      if (seedData.navigation) {
        seed["SITE#config:NAVIGATION"] = seedData.navigation;
      }
      if (Array.isArray(seedData.pages)) {
        for (const page of seedData.pages) {
          if (page && page.path) {
            seed[`PAGE:${normalizePath(page.path)}`] = page;
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to seed initial local content store:", err);
  }

  fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(seed, null, 2), "utf-8");
  return seed;
}

function writeLocalStore(data: Record<string, any>) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Universal getItem: tries DynamoDB, falls back to local JSON store.
 */
export async function getDbItem<T>(pk: string, sk: string): Promise<T | null> {
  if (ddbDocClient && process.env.CONTENT_SOURCE === "dynamodb") {
    try {
      const res = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { pk, sk },
        })
      );
      if (res.Item) {
        return (res.Item.data ?? res.Item) as T;
      }
    } catch (err) {
      console.warn(`[DynamoDB Get Error ${pk}/${sk}]: Falling back to local store`, err);
    }
  }

  const store = ensureLocalStore();
  const key = `${pk}:${sk}`;
  return (store[key] as T) || null;
}

/**
 * Universal putItem: tries DynamoDB, also writes to local store.
 */
export async function putDbItem(pk: string, sk: string, data: any): Promise<void> {
  const store = ensureLocalStore();
  store[`${pk}:${sk}`] = data;
  writeLocalStore(store);

  if (ddbDocClient && process.env.CONTENT_SOURCE === "dynamodb") {
    try {
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            pk,
            sk,
            data,
            updatedAt: new Date().toISOString(),
          },
        })
      );
    } catch (err) {
      console.error(`[DynamoDB Put Error ${pk}/${sk}]:`, err);
    }
  }
}

/**
 * Universal queryByPk: finds all items with matching partition key.
 */
export async function queryDbByPk<T>(pk: string): Promise<T[]> {
  if (ddbDocClient && process.env.CONTENT_SOURCE === "dynamodb") {
    try {
      const allItems: any[] = [];
      let exclusiveStartKey: Record<string, any> | undefined = undefined;

      do {
        const res: any = await ddbDocClient.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: { ":pk": pk },
            ExclusiveStartKey: exclusiveStartKey,
          })
        );
        if (res.Items) {
          allItems.push(...res.Items);
        }
        exclusiveStartKey = res.LastEvaluatedKey;
      } while (exclusiveStartKey);

      return allItems.map((item) => {
        const unwrapped =
          item && item.data && typeof item.data === "object"
            ? { ...item.data }
            : item && typeof item === "object"
            ? { ...item }
            : item;
        if (unwrapped && typeof unwrapped === "object" && !unwrapped.path && item.sk) {
          unwrapped.path = item.sk;
        }
        return unwrapped as T;
      });
    } catch (err) {
      console.warn(`[DynamoDB Query Error ${pk}]: Falling back to local store`, err);
    }
  }

  const store = ensureLocalStore();
  const prefix = `${pk}:`;
  const results: T[] = [];
  for (const [k, v] of Object.entries(store)) {
    if (k.startsWith(prefix)) {
      const unwrapped = v && typeof v === "object" ? { ...v } : v;
      if (unwrapped && typeof unwrapped === "object" && !unwrapped.path) {
        unwrapped.path = k.slice(prefix.length);
      }
      results.push(unwrapped as T);
    }
  }
  return results;
}

/**
 * Universal deleteItem.
 */
export async function deleteDbItem(pk: string, sk: string): Promise<void> {
  const store = ensureLocalStore();
  delete store[`${pk}:${sk}`];
  writeLocalStore(store);

  if (ddbDocClient && process.env.CONTENT_SOURCE === "dynamodb") {
    try {
      await ddbDocClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { pk, sk },
        })
      );
    } catch (err) {
      console.error(`[DynamoDB Delete Error ${pk}/${sk}]:`, err);
    }
  }
}

// ============================================================================
// IA v2 Domain Methods (Pages, Redirects, Navigation)
// ============================================================================

export function normalizePath(p: string): string {
  if (!p) return "/";
  let clean = p.trim();
  if (!clean.startsWith("/")) clean = "/" + clean;
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);
  return clean;
}

/**
 * Retrieve a page by its normalized full path (e.g. /seo/local-seo).
 */
export async function getPageByPath(rawPath: string): Promise<PageRecordV2 | null> {
  const normalized = normalizePath(rawPath);
  const custom = await getDbItem<PageRecordV2>("PAGE", normalized);
  if (custom && custom.path) {
    return custom;
  }
  try {
    const seed = require("@/content/ia-v2.seed.json");
    if (seed && Array.isArray(seed.pages)) {
      const match = seed.pages.find((p: any) => normalizePath(p.path) === normalized);
      if (match) return match as PageRecordV2;
    }
  } catch {}
  return null;
}

/**
 * Retrieve all pages.
 */
export async function getAllPages(): Promise<PageRecordV2[]> {
  const pages = await queryDbByPk<PageRecordV2>("PAGE");
  const valid = pages.filter(
    (p) => p && typeof p === "object" && typeof p.path === "string" && p.path.trim().length > 0
  );
  if (valid.length > 0) {
    return valid;
  }
  try {
    const seed = require("@/content/ia-v2.seed.json");
    if (seed && Array.isArray(seed.pages)) {
      return seed.pages as PageRecordV2[];
    }
  } catch {}
  return [];
}

/**
 * Save or update a page by its full path.
 */
export async function savePage(page: PageRecordV2): Promise<void> {
  const normalized = normalizePath(page.path);
  page.path = normalized;
  page.updatedAt = new Date().toISOString();
  await putDbItem("PAGE", normalized, page);
}

/**
 * Delete a page by its full path.
 */
export async function deletePageByPath(rawPath: string): Promise<void> {
  const normalized = normalizePath(rawPath);
  await deleteDbItem("PAGE", normalized);
}

/**
 * Retrieve a 301/308 redirect record for a given path.
 */
export async function getRedirect(rawPath: string): Promise<RedirectRecord | null> {
  const normalized = normalizePath(rawPath);
  const custom = await getDbItem<RedirectRecord>("REDIRECT", normalized);
  if (custom && custom.to) {
    return custom;
  }
  const legacy = RAW_REDIRECT_MAP[normalized];
  if (legacy) {
    return {
      from: normalized,
      to: legacy.to,
      status: 301,
      createdAt: "2026-10-31T00:00:00.000Z",
    };
  }
  return null;
}

/**
 * Retrieve all redirect records.
 */
export async function getAllRedirects(): Promise<RedirectRecord[]> {
  const custom = await queryDbByPk<RedirectRecord>("REDIRECT");
  const valid = custom.filter((r) => r && typeof r.from === "string" && typeof r.to === "string");
  if (valid.length > 0) {
    return valid;
  }
  return Object.entries(RAW_REDIRECT_MAP).map(([from, target]) => ({
    from,
    to: target.to,
    status: 301,
    createdAt: "2026-10-31T00:00:00.000Z",
  }));
}

/**
 * Save a 301 redirect record.
 * Refuses self-referential / identity redirects (source === target).
 */
export async function saveRedirect(redirect: RedirectRecord): Promise<void> {
  const from = normalizePath(redirect.from);
  const to = normalizePath(redirect.to);

  // Programmatic refusal of identity redirects
  if (from === to) {
    console.warn(`[Redirect Skipped] Identity redirect ignored: ${from} -> ${to}`);
    return;
  }

  const record: RedirectRecord = {
    from,
    to,
    status: redirect.status || 301,
    createdAt: redirect.createdAt || new Date().toISOString(),
  };

  await putDbItem("REDIRECT", from, record);
}

/**
 * Delete a redirect record by source path.
 */
export async function deleteRedirect(rawFrom: string): Promise<void> {
  const normalized = normalizePath(rawFrom);
  await deleteDbItem("REDIRECT", normalized);
}

/**
 * Retrieve the current navigation record.
 */
export async function getNavigation(): Promise<NavigationRecord | null> {
  const custom = await getDbItem<NavigationRecord>("SITE#config", "NAVIGATION");
  if (custom && Array.isArray(custom.menus) && custom.menus.length > 0) {
    return custom;
  }
  try {
    const seed = require("@/content/ia-v2.seed.json");
    if (seed && seed.navigation && Array.isArray(seed.navigation.menus)) {
      return seed.navigation as NavigationRecord;
    }
  } catch (err) {
    console.error("Failed to load fallback navigation:", err);
  }
  return null;
}

/**
 * Retrieve the previous navigation record backup.
 */
export async function getPreviousNavigation(): Promise<NavigationRecord | null> {
  return getDbItem<NavigationRecord>("SITE#config", "NAVIGATION#previous");
}

/**
 * Save the navigation record.
 */
export async function saveNavigation(nav: NavigationRecord): Promise<void> {
  nav.updatedAt = new Date().toISOString();
  await putDbItem("SITE#config", "NAVIGATION", nav);
}

/**
 * Save the navigation record with an automatic backup of the previous version.
 * Stores previous version at SITE#config:NAVIGATION#previous.
 * Stamps updatedBy and updatedAt on the new record.
 */
export async function saveNavigationWithBackup(
  nav: NavigationRecord,
  updatedBy?: string
): Promise<void> {
  const current = await getNavigation();
  if (current) {
    await putDbItem("SITE#config", "NAVIGATION#previous", current);
  }
  nav.updatedAt = new Date().toISOString();
  if (updatedBy) {
    nav.updatedBy = updatedBy;
  }
  await putDbItem("SITE#config", "NAVIGATION", nav);
}

/**
 * Restore the previous navigation record backup.
 * Swaps previous to current and current to previous.
 * Stamps updatedBy and updatedAt.
 */
export async function restorePreviousNavigation(
  restoredBy?: string
): Promise<NavigationRecord | null> {
  const previous = await getPreviousNavigation();
  if (!previous) {
    throw new Error("No previous navigation version found to restore.");
  }
  const current = await getNavigation();
  if (current) {
    await putDbItem("SITE#config", "NAVIGATION#previous", current);
  }
  previous.updatedAt = new Date().toISOString();
  if (restoredBy) {
    previous.updatedBy = restoredBy;
  }
  await putDbItem("SITE#config", "NAVIGATION", previous);
  return previous;
}

/**
 * Universal export of all records across all partition keys (PAGE, REDIRECT, SITE#config, PAGE#home, USER).
 * Used for full backups on local and DynamoDB stores.
 */
export async function exportAllDbRecords(): Promise<Record<string, any>> {
  if (process.env.CONTENT_SOURCE === "dynamodb") {
    if (!ddbDocClient) {
      throw new Error("[Backup Abort] CONTENT_SOURCE=dynamodb but DynamoDB DocumentClient is not initialized.");
    }
    const map: Record<string, any> = {};
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;
    try {
      do {
        const res: any = await ddbDocClient.send(
          new ScanCommand({
            TableName: TABLE_NAME,
            ExclusiveStartKey: lastEvaluatedKey,
          })
        );
        if (res.Items) {
          for (const item of res.Items) {
            const key = `${item.pk}:${item.sk}`;
            map[key] = item.data ?? item;
          }
        }
        lastEvaluatedKey = res.LastEvaluatedKey;
      } while (lastEvaluatedKey);
      return map;
    } catch (err: any) {
      throw new Error(`[Backup Abort] Failed to scan DynamoDB table "${TABLE_NAME}" during backup: ${err?.message || err}`);
    }
  }

  const store = ensureLocalStore();
  return JSON.parse(JSON.stringify(store));
}


