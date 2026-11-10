const fs = require("fs");
const path = require("path");

async function main() {
  const storePath = path.join(process.cwd(), ".data", "content-store.json");
  console.log("Checking database store at:", storePath);

  if (!fs.existsSync(storePath)) {
    console.error("Local store does not exist!");
    process.exit(1);
  }

  const raw = fs.readFileSync(storePath, "utf-8");
  const store = JSON.parse(raw);

  // Check chat widget config
  const chatConfig = store["SITE#config:CHAT_WIDGET"];
  console.log("\n--- Chat Widget Config in DB ---");
  console.log(JSON.stringify(chatConfig || "Default will be used", null, 2));

  // Check if any inquiries exist or inspect inquiry structure
  const inquiryKeys = Object.keys(store).filter(k => k.startsWith("INQUIRY:"));
  console.log(`\nFound ${inquiryKeys.length} inquiry records in DB.`);
  if (inquiryKeys.length > 0) {
    console.log("Sample inquiry:", JSON.stringify(store[inquiryKeys[0]], null, 2));
  }
}

main().catch(console.error);

