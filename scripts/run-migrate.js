const path = require("path");
const createJiti = require("jiti");

const jiti = createJiti(__filename, {
  alias: {
    "server-only": path.resolve(__dirname, "empty.js"),
    "@": path.resolve(__dirname, "../src"),
  },
});

jiti(path.resolve(__dirname, "migrate-ia-v2.ts"));
