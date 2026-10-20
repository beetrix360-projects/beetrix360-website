import "server-only";
import defaultHomepage from "@/content/homepage.json";
import defaultSite from "@/content/site.json";
import { getDbItem, putDbItem } from "./db";
import type { HomepageContent, SiteSettings } from "./types";

/**
 * Content access layer backed by DynamoDB (with local fallback).
 */

export async function getHomepageContent(): Promise<HomepageContent> {
  const custom = await getDbItem<HomepageContent>("PAGE#home", "CONTENT");
  if (custom && custom.hero && custom.hero.headline) {
    return custom;
  }
  return defaultHomepage as unknown as HomepageContent;
}

export async function saveHomepageContent(content: HomepageContent): Promise<void> {
  await putDbItem("PAGE#home", "CONTENT", content);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const custom = await getDbItem<SiteSettings>("SITE#config", "SETTINGS");
  if (custom && custom.name) {
    return custom;
  }
  return defaultSite as SiteSettings;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await putDbItem("SITE#config", "SETTINGS", settings);
}
