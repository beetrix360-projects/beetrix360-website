export interface ChatWidgetConfig {
  enabled: boolean;
  whatsappNumber: string;
  headerTitle: string;
  headerSubtitle: string;
  agentName: string;
  agentAvatar: string;
  popupWelcome: string;
  defaultMessageTemplate: string;
  scrollThreshold: number; // e.g. 60 for 60%
  position: "bottom-right" | "bottom-left";
  buttonLabel: string;
  showLabel: boolean;
  primaryColor: string;
  updatedAt?: string;
}

export const DEFAULT_CHAT_WIDGET_CONFIG: ChatWidgetConfig = {
  enabled: true,
  whatsappNumber: "+14244416042",
  headerTitle: "Chat with Beetrix360",
  headerSubtitle: "Typically replies within 15 minutes",
  agentName: "Beetrix360 Growth Team",
  agentAvatar: "",
  popupWelcome: "Hi there! 👋 How can we help you accelerate your digital revenue today?",
  defaultMessageTemplate: "Hi Beetrix360 team! I am on the {pageTitle} page ({pageUrl}) and have an inquiry.",
  scrollThreshold: 60, // 60% scroll display as requested
  position: "bottom-right",
  buttonLabel: "Chat on WhatsApp",
  showLabel: true,
  primaryColor: "#25D366", // Official WhatsApp green
};
