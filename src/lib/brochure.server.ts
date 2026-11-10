import "server-only";
import { getDbItem, putDbItem } from "./db";
import { BrochureConfig, DEFAULT_BROCHURE_CONFIG } from "./brochure";

const PK_SITE_CONFIG = "SITE_CONFIG";
const SK_BROCHURE = "BROCHURE";

export async function getBrochureConfig(): Promise<BrochureConfig> {
  try {
    const saved = await getDbItem<BrochureConfig>(PK_SITE_CONFIG, SK_BROCHURE);
    if (!saved) return DEFAULT_BROCHURE_CONFIG;
    return {
      ...DEFAULT_BROCHURE_CONFIG,
      ...saved,
    };
  } catch (err) {
    console.error("[brochure] Error reading config from db:", err);
    return DEFAULT_BROCHURE_CONFIG;
  }
}

export async function saveBrochureConfig(
  updates: Partial<BrochureConfig>
): Promise<BrochureConfig> {
  const current = await getBrochureConfig();
  const merged: BrochureConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await putDbItem(PK_SITE_CONFIG, SK_BROCHURE, merged);
  return merged;
}

