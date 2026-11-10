const fs = require("fs");
const path = require("path");

const storePath = path.join(process.cwd(), ".data", "content-store.json");
const targetPath = path.join(process.cwd(), "src", "content", "media-placements.seed.json");

if (!fs.existsSync(storePath)) {
  console.error(".data/content-store.json not found!");
  process.exit(1);
}

const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));
const mediaPlacements = {};

for (const [key, value] of Object.entries(store)) {
  if (key.startsWith("MEDIA_PLACEMENT:")) {
    mediaPlacements[key] = value;
  }
}

const count = Object.keys(mediaPlacements).length;
console.log(`Extracting ${count} media placements from local store...`);

fs.writeFileSync(targetPath, JSON.stringify(mediaPlacements, null, 2), "utf-8");
console.log(`Saved ${count} media placements to: ${targetPath}`);

