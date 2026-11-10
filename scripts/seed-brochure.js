const fs = require("fs");
const path = require("path");

const storePath = path.join(process.cwd(), ".data", "content-store.json");
const raw = fs.readFileSync(storePath, "utf-8");
const store = JSON.parse(raw);

store["SITE_CONFIG:BROCHURE"] = {
  enabled: true,
  buttonLabel: "Download E-Brochure",
  fileUrl: "/downloads/beetrix360-corporate-brochure.pdf",
  fileName: "Beetrix360-Corporate-Capabilities-Brochure.pdf",
  fileSize: "PDF • 3.2 MB",
  description: "Comprehensive guide to Beetrix360's AI search, workflow automation, and revenue systems.",
  updatedAt: new Date().toISOString()
};

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
console.log("Successfully seeded SITE_CONFIG:BROCHURE in content-store.json!");

