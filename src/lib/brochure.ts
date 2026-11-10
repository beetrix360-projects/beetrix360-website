export interface BrochureConfig {
  enabled: boolean;
  buttonLabel: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  description?: string;
  updatedAt?: string;
}

export const DEFAULT_BROCHURE_CONFIG: BrochureConfig = {
  enabled: true,
  buttonLabel: "Download E-Brochure",
  fileUrl: "/downloads/beetrix360-corporate-brochure.pdf",
  fileName: "Beetrix360-Corporate-Capabilities-Brochure.pdf",
  fileSize: "PDF • 3.2 MB",
  description: "Comprehensive guide to Beetrix360's AI search, workflow automation, and revenue systems.",
};

