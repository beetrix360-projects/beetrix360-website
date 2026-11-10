const fs = require("fs");
const path = require("path");

const storePath = path.join(process.cwd(), ".data", "content-store.json");
const raw = fs.readFileSync(storePath, "utf-8");
const store = JSON.parse(raw);

// Initialize default chat widget config in database
store["SITE#config:CHAT_WIDGET"] = {
  enabled: true,
  whatsappNumber: "+14244416042",
  agentName: "Sarah Chen",
  agentRole: "Senior Growth Strategist",
  avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=face",
  defaultMessageTemplate: "Hi BeeTrix360 team! I'm on {pageTitle} ({pageUrl}) and would like to explore growth opportunities.",
  scrollThreshold: 60,
  themeColor: "#25D366",
  position: "bottom-right",
  quickPrompts: [
    "I need an AI search audit",
    "Can you automate our workflows?",
    "We need a custom AI agent",
    "Book a 15-min discovery call"
  ]
};

// Add a sample inquiry record to demonstrate CRM functionality
const sampleId = "lead_test_sample_01";
store[`INQUIRY:${sampleId}`] = {
  id: sampleId,
  name: "Marcus Sterling",
  email: "marcus.sterling@apexglobal.io",
  whatsapp: "+1 (424) 441-6042",
  website: "apexglobal.io",
  goal: "AI search",
  budget: "$10k – $25k",
  notes: "Looking to audit our search presence across Perplexity and ChatGPT for our B2B SaaS launch.",
  pageUrl: "https://www.beetrix360.com/seo",
  sectionName: "SEO Page Blueprint Section (#start)",
  buttonName: "Get my blueprint",
  status: "new",
  createdAt: new Date().toISOString(),
  emailSent: false
};

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
console.log("Successfully seeded default chat widget config and verified sample lead inquiry in content-store.json!");

