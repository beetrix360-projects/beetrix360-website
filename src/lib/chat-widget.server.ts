import "server-only";
import { getDbItem, putDbItem } from "./db";
import { ChatWidgetConfig, DEFAULT_CHAT_WIDGET_CONFIG } from "./chat-widget";

const PK_SITE_CONFIG = "SITE_CONFIG";
const SK_CHAT_WIDGET = "CHAT_WIDGET";

export async function getChatWidgetConfig(): Promise<ChatWidgetConfig> {
  try {
    const saved = await getDbItem<ChatWidgetConfig>(PK_SITE_CONFIG, SK_CHAT_WIDGET);
    if (!saved) return DEFAULT_CHAT_WIDGET_CONFIG;
    return {
      ...DEFAULT_CHAT_WIDGET_CONFIG,
      ...saved,
    };
  } catch (err) {
    console.error("[chat-widget] Error reading config from db:", err);
    return DEFAULT_CHAT_WIDGET_CONFIG;
  }
}

export async function saveChatWidgetConfig(
  updates: Partial<ChatWidgetConfig>
): Promise<ChatWidgetConfig> {
  const current = await getChatWidgetConfig();
  const merged: ChatWidgetConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await putDbItem(PK_SITE_CONFIG, SK_CHAT_WIDGET, merged);
  return merged;
}

