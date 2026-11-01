module.exports = {
  "/automation": {
    metaDescription: "Workflow automation and systems integration services by Beetrix360. We eliminate manual data entry, connect APIs, and streamline operations.",
    tagline: "End-to-end workflow automation, API systems integration, and business process optimization.",
    overview: [
      "Fragmented software tools and manual copy-pasting between systems waste valuable staff hours and introduce operational errors. We build automated workflow pipelines that connect your business applications and move data seamlessly.",
      "Our automation engineers design resilient webhook integrations, low-code automations, and custom API scripts. We help growing businesses streamline lead routing, invoice processing, and customer onboarding to scale operations efficiently."
    ],
    deliverablesTitle: "Automation Capabilities",
    deliverables: [
      "Custom workflow automation architecture connecting CRM, ERP, and communication platforms",
      "Robust API integration and webhook trigger engineering with automatic retry error handling",
      "Automated document and invoice data extraction pipelines eliminating manual entry",
      "Cross-platform data synchronization maintaining single-source-of-truth accuracy",
      "Executive automation health dashboard monitoring active executions and error logs"
    ],
    processTitle: "Workflow Automation Lifecycle",
    process: [
      { step: 1, title: "Process Discovery & Mapping", description: "Documenting repetitive manual steps, software tools involved, and data transformation rules." },
      { step: 2, title: "Architecture & Integration Design", description: "Selecting appropriate integration platforms (Make, Zapier, custom Python) and mapping endpoints." },
      { step: 3, title: "Automated Pipeline Build", description: "Coding webhook listeners, data sanitization filters, and automated destination triggers." },
      { step: 4, title: "Sandbox Testing & Activation", description: "Simulating high-volume transaction loads, testing error handling, and launching live workflows." }
    ],
    faqs: [
      { question: "What automation platforms does Beetrix360 build with?", answer: "We build with Make (Integromat), Zapier, n8n, custom Python/Node.js serverless functions, and enterprise iPaaS tools." },
      { question: "How do you handle software API updates or breaking changes?", answer: "We build automated error-alerting hooks and logging systems that notify engineers immediately if an API payload structure changes." },
      { question: "Can legacy on-premise software be connected to cloud automations?", answer: "Yes, we deploy secure database webhooks, sFTP listeners, and hybrid API bridges connecting local servers to modern cloud tools." }
    ]
  },
  "/automation/business-process-automation": {
    metaDescription: "Business Process Automation (BPA) services from Beetrix360. We digitize manual operational handoffs and streamline back-office workflows.",
    tagline: "Operational process re-engineering, digital handoff automation, and back-office efficiency systems.",
    overview: [
      "Manual approvals, email chains, and disconnected spreadsheets slow down operational velocity and increase administrative overhead. We re-engineer internal operations through structured Business Process Automation (BPA).",
      "We design automated approval hierarchies, task dispatching logic, and digital operational dashboards. We help leadership teams eliminate operational bottlenecks, standardize service delivery, and gain clear operational visibility."
    ],
    deliverablesTitle: "BPA Deliverables",
    deliverables: [
      "End-to-end operational process mapping identifying redundant steps and approval delays",
      "Automated approval workflows and notification routing across Slack, Teams, and email",
      "Standard operating procedure (SOP) digitization into interactive task management systems",
      "Cross-departmental project handoff triggers connecting sales, delivery, and accounting",
      "Operational velocity reporting measuring cycle time reductions and process compliance"
    ],
    processTitle: "Process Automation Framework",
    process: [
      { step: 1, title: "Operational Value Stream Mapping", description: "Interviewing departmental leads to trace how tasks, data, and approvals move through the firm." },
      { step: 2, title: "Process Standardization", description: "Simplifying redundant approval chains and standardizing required data fields before automation." },
      { step: 3, title: "Automated Workflow Build", description: "Deploying automated routing triggers, task assignments, and conditional approval gates." },
      { step: 4, title: "Team Enablement & Training", description: "Conducting hands-on walkthroughs and delivering operational runbooks for internal teams." }
    ],
    faqs: [
      { question: "What is the difference between RPA and BPA?", answer: "Robotic Process Automation (RPA) mimics human keystrokes on legacy UIs, while Business Process Automation (BPA) redesigns and connects entire workflows via APIs." },
      { question: "How does BPA reduce internal project delivery times?", answer: "By automating handoffs between departments and removing manual approval pauses, project phases advance immediately upon milestone completion." },
      { question: "Can internal security permissions be enforced within automated workflows?", answer: "Yes, we implement strict role-based access rules ensuring employees only view and approve data relevant to their authorized responsibilities." }
    ]
  },
  "/automation/document-processing": {
    metaDescription: "Intelligent Document Processing (IDP) by Beetrix360. We automate data extraction from invoices, contracts, receipts, and PDF files.",
    tagline: "Intelligent Document Processing (IDP), automated PDF data extraction, and OCR reconciliation.",
    overview: [
      "Manually reviewing PDFs, paper invoices, medical forms, and contracts is slow, tedious, and prone to human data entry mistakes. We build Intelligent Document Processing (IDP) systems that extract, validate, and route data automatically.",
      "Our solutions combine optical character recognition (OCR) with large language models to understand complex document layouts, tables, and handwritten notes. We feed extracted, verified data directly into your ERP or accounting software."
    ],
    deliverablesTitle: "Document Processing Deliverables",
    deliverables: [
      "Automated PDF and image document ingestion via monitored email inboxes, cloud folders, or APIs",
      "Advanced OCR and layout-aware machine learning extracting tabular data, dates, and amounts",
      "Rule-based data validation verifying calculations and matching purchase orders to invoices",
      "Direct accounting software synchronization updating QuickBooks, Xero, NetSuite, or SAP",
      "Exception management portal allowing human staff to review ambiguous low-confidence fields"
    ],
    processTitle: "IDP Pipeline Workflow",
    process: [
      { step: 1, title: "Document Taxonomy Setup", description: "Cataloging incoming document types (invoices, bills of lading, W-9s) and required extraction fields." },
      { step: 2, title: "Model & Parser Training", description: "Configuring OCR and vision-language models to recognize varying vendor layouts and line items." },
      { step: 3, title: "Validation & Matching Rules", description: "Programming automated three-way matching reconciling invoices against purchase orders and receipts." },
      { step: 4, title: "Accounting Software Ingestion", description: "Routing verified data into accounting systems and archiving original documents securely." }
    ],
    faqs: [
      { question: "Can intelligent document processing handle unstructured or varied vendor layouts?", answer: "Yes, unlike rigid template scrapers, modern vision-language models understand semantic context and extract data regardless of where fields appear on the page." },
      { question: "How accurate is automated document data extraction?", answer: "Clean digital PDFs typically achieve 98 to 99 percent extraction accuracy, while low-confidence items are automatically flagged for quick human review." },
      { question: "Which accounting platforms can be integrated with automated invoice processing?", answer: "We build direct integrations for QuickBooks Online, Xero, NetSuite, Sage Intacct, and enterprise SAP environments." }
    ]
  },
  "/automation/data-entry-automation": {
    metaDescription: "Automated data entry and synchronization services from Beetrix360. We eliminate repetitive manual data handling between disconnected software tools.",
    tagline: "Automated data entry elimination, cross-database synchronization, and manual transcription reduction.",
    overview: [
      "Copying and pasting customer information, lead details, or inventory numbers across disparate software systems consumes valuable team hours and introduces costly typos. We engineer automated data entry and synchronization pipelines.",
      "Our systems monitor data changes in real time, format fields appropriately, and update destination databases instantly. We help businesses liberate staff from mundane data entry to focus on high-value analysis and customer care."
    ],
    deliverablesTitle: "Data Entry Deliverables",
    deliverables: [
      "Real-time data synchronization pipelines connecting spreadsheets, CRMs, and operational databases",
      "Automated lead ingestion and data enrichment from web forms, event badges, and emails",
      "Data formatting and phone/address normalization matching destination system standards",
      "Duplicate record detection and automated merging maintaining clean database hygiene",
      "Audit logging recording every data transfer and sync event for accountability"
    ],
    processTitle: "Data Automation Steps",
    process: [
      { step: 1, title: "Data Source & Destination Mapping", description: "Identifying all manual data entry touchpoints and mapping field-to-field relationships." },
      { step: 2, title: "Transformation Logic Build", description: "Coding formatting rules, capitalizations, phone number cleaning, and field calculations." },
      { step: 3, title: "Two-Way Sync Architecture", description: "Establishing webhook listeners or scheduled polling syncs with conflict resolution rules." },
      { step: 4, title: "Reconciliation & Validation", description: "Comparing historical records against automated sync outputs to ensure 100 percent data accuracy." }
    ],
    faqs: [
      { question: "How do you resolve conflicts in two-way database synchronization?", answer: "We establish clear precedence rules (e.g. CRM always overrides spreadsheets) and timestamp comparisons to prevent data overwrites." },
      { question: "Can data entry automation clean up existing messy databases?", answer: "Yes, our pipelines can process existing customer databases to remove duplicates, fix formatting errors, and verify email addresses." },
      { question: "What security safeguards protect data during automated transfer?", answer: "All data is encrypted in transit using TLS 1.3, processed through authenticated API connections, and never stored on third-party servers." }
    ]
  },
  "/automation/api-integration": {
    metaDescription: "Custom API development and systems integration by Beetrix360. We connect cloud platforms, payment gateways, and databases with reliable code.",
    tagline: "Custom API development, webhook listener architectures, third-party software connectors, and middleware.",
    overview: [
      "Modern businesses rely on dozens of software-as-a-service (SaaS) tools that rarely communicate effectively out of the box. We design, code, and deploy custom API integrations that bridge incompatible systems into a unified digital infrastructure.",
      "Our integration engineers build secure webhooks, custom middleware, and asynchronous data queues that handle high data volumes without timeouts. We help organizations break down software silos and automate cross-platform workflows."
    ],
    deliverablesTitle: "API Integration Deliverables",
    deliverables: [
      "Custom RESTful and GraphQL API connector development tailored to your exact business requirements",
      "Serverless webhook listeners (AWS Lambda, Cloudflare Workers) processing incoming data in real time",
      "Asynchronous message queuing (RabbitMQ, AWS SQS) preventing data loss during traffic spikes",
      "API rate limit handling, token rotation, and exponential backoff retry algorithms",
      "Comprehensive API documentation and Postman collections for internal engineering teams"
    ],
    processTitle: "API Integration Architecture",
    process: [
      { step: 1, title: "API Endpoint & Schema Audit", description: "Reviewing vendor API documentation, rate limits, authentication protocols, and payload schemas." },
      { step: 2, title: "Middleware Architecture", description: "Designing scalable serverless functions, database connection pooling, and error queues." },
      { step: 3, title: "Data Transformation Coding", description: "Writing translation code converting source data into exact destination payload structures." },
      { step: 4, title: "Load & Security Testing", description: "Simulating burst webhook traffic to verify queue stability, rate limit resilience, and security." }
    ],
    faqs: [
      { question: "What is the difference between a REST API and a Webhook?", answer: "An API requires your system to ask for data (polling), whereas a webhook sends data automatically the instant an event occurs (push)." },
      { question: "How do you prevent data loss when a third-party API experiences downtime?", answer: "We implement message queues (like AWS SQS) that safely hold pending data and automatically retry transfers once the target service recovers." },
      { question: "Can you integrate software that lacks public API documentation?", answer: "If a tool lacks modern APIs, we can explore database direct connections, automated sFTP exports, or custom web automation scrapers." }
    ]
  },
  "/automation/no-code-automation": {
    metaDescription: "Low-code and no-code automation solutions from Beetrix360. We build maintainable automated workflows in Make, Zapier, and n8n for rapid deployment.",
    tagline: "Make (Integromat) and Zapier workflow automation, n8n self-hosted pipelines, and visual integration.",
    overview: [
      "Building every internal automation from scratch with custom software code is often unnecessary and slow. We leverage visual low-code and no-code platforms like Make, Zapier, and n8n to deploy sophisticated business automations in days rather than months.",
      "Our low-code architectures incorporate modular scenario design, centralized error handling, and documentation. We deliver flexible automations that internal non-technical staff can understand, monitor, and adjust as business needs evolve."
    ],
    deliverablesTitle: "No-Code Deliverables",
    deliverables: [
      "Complex multi-step scenario architecture built in Make (formerly Integromat) or Zapier",
      "Self-hosted n8n deployment for organizations requiring complete data privacy and zero per-task fees",
      "Global error handling routes and instant notification triggers alerting staff of scenario failures",
      "Webhook listeners and JSON data parsing modules handling dynamic form submissions",
      "Interactive workflow documentation and video handover walkthroughs for internal teams"
    ],
    processTitle: "No-Code Build Process",
    process: [
      { step: 1, title: "Workflow Scoping", description: "Identifying trigger events, required filter conditions, data transformations, and destination actions." },
      { step: 2, title: "Visual Scenario Assembly", description: "Connecting application modules, configuring routers, and mapping data fields in Make or Zapier." },
      { step: 3, title: "Error Handling Architecture", description: "Adding error break routes, rollback directives, and Slack alert notifications for failed runs." },
      { step: 4, title: "Live Simulation & Enablement", description: "Executing end-to-end test data runs and training internal team members on scenario management." }
    ],
    faqs: [
      { question: "Why choose Make (Integromat) over Zapier for complex business automations?", answer: "Make offers advanced visual routing, array aggregators, superior error handling, and significantly lower operational cost at scale." },
      { question: "What is n8n and why is it popular for enterprise no-code automation?", answer: "n8n is a powerful open-source workflow automation platform that can be self-hosted on private servers, ensuring data never leaves your infrastructure." },
      { question: "Can internal teams maintain and modify low-code automations after launch?", answer: "Yes, visual workflows are accessible to non-technical staff, and we provide clear video documentation showing how to adjust fields." }
    ]
  },
  "/automation/crm-automation": {
    metaDescription: "CRM workflow automation services by Beetrix360. We automate lead assignment, lifecycle stage triggers, and sales tasks in HubSpot and Salesforce.",
    tagline: "CRM lifecycle automation, lead assignment routing, deal stage automation, and pipeline hygiene.",
    overview: [
      "A CRM is only as powerful as the automated workflows supporting it; without automation, deal records become outdated and sales follow-up slips through cracks. We build automated CRM workflows that manage lead routing, deal progression, and sales alerts.",
      "We configure round-robin lead distribution, automated task assignments, deal velocity alerts, and customer re-engagement sequences. We help sales organizations maintain clean pipeline data while accelerating deal closing speeds."
    ],
    deliverablesTitle: "CRM Automation Deliverables",
    deliverables: [
      "Automated lead assignment rules, round-robin routing, and territory management logic",
      "Lifecycle stage progression triggers updating customer status based on website and email activity",
      "Stalled deal notifications alerting managers when opportunities remain inactive past thresholds",
      "Automated sales task creation reminding representatives to follow up at critical milestones",
      "Closed-won onboarding handoff workflows creating customer delivery projects automatically"
    ],
    processTitle: "CRM Automation Setup",
    process: [
      { step: 1, title: "Sales Process Alignment", description: "Mapping deal pipeline stages, mandatory qualification fields, and sales representative territory rules." },
      { step: 2, title: "Automation Blueprint Design", description: "Drafting visual workflow trees detailing enrollment triggers, time delays, and branching conditions." },
      { step: 3, title: "Workflow Build & Testing", description: "Configuring native automation engines in HubSpot or Salesforce and testing lead enrollment." },
      { step: 4, title: "Sales Team Rollout", description: "Demonstrating automated task queues and notifications to sales representatives to drive adoption." }
    ],
    faqs: [
      { question: "What CRM platforms do you build automations for?", answer: "We build advanced automations within HubSpot CRM, Salesforce Sales Cloud, Pipedrive, and Zoho CRM." },
      { question: "How does automated round-robin lead routing work?", answer: "Inbound leads are automatically distributed equally among available sales representatives based on territory, language, or workload capacity." },
      { question: "Can CRM automations trigger external actions outside the CRM?", answer: "Yes, CRM workflows can trigger external webhooks to generate invoices, create Slack channels, or provision project management boards." }
    ]
  },
  "/automation/marketing-automation": {
    metaDescription: "Omnichannel marketing automation services from Beetrix360. We synchronize email, SMS, advertising audiences, and lead scoring systems.",
    tagline: "Cross-channel marketing automation, behavioral lead scoring, dynamic audience sync, and campaign orchestration.",
    overview: [
      "Modern marketing requires delivering timely, personalized messages across multiple digital channels based on prospect behavior. We build cross-channel marketing automation systems that orchestrate email, SMS, ad audiences, and web personalization.",
      "Our marketing automation frameworks track user engagement across all digital touchpoints, scoring prospect intent dynamically. We trigger appropriate messaging at the exact moment prospects show buying interest."
    ],
    deliverablesTitle: "Marketing Automation Deliverables",
    deliverables: [
      "Multi-channel automated customer journeys coordinating email sequences, SMS alerts, and web experiences",
      "Behavioral lead scoring models evaluating content downloads, pricing page visits, and email engagement",
      "Dynamic advertising audience synchronization updating Google and Meta custom audiences in real time",
      "Automated event webinar and conference follow-up workflows driving attendance and consultation bookings",
      "Marketing attribution and campaign velocity reporting measuring lead progression through the funnel"
    ],
    processTitle: "Marketing Automation Workflow",
    process: [
      { step: 1, title: "Touchpoint Inventory", description: "Cataloging all digital touchpoints where prospects engage (website, ads, email, webinars)." },
      { step: 2, title: "Scoring Model Architecture", description: "Defining positive and negative point values for user actions to identify sales-ready leads." },
      { step: 3, title: "Journey Configuration", description: "Building multi-channel automated workflows in HubSpot, Klaviyo, or ActiveCampaign." },
      { step: 4, title: "Audience Sync Setup", description: "Connecting real-time audience syncs to advertising networks for automated retargeting suppression." }
    ],
    faqs: [
      { question: "What is behavioral lead scoring in marketing automation?", answer: "It assigns point values to user actions (e.g. visiting pricing equals +15 points), automatically alerting sales when a lead crosses a qualification threshold." },
      { question: "How does dynamic audience sync save advertising budget?", answer: "It automatically removes converted leads and customers from top-of-funnel ad campaigns, eliminating wasted ad spend on existing buyers." },
      { question: "Can marketing automations incorporate SMS text messaging?", answer: "Yes, we integrate compliant SMS messaging for appointment reminders, flash promotions, and urgent transactional updates." }
    ]
  },
  "/automation/salesforce-marketing-automation": {
    metaDescription: "Salesforce Marketing Cloud and Account Engagement (Pardot) automation by Beetrix360. We architect enterprise journeys and CRM sync.",
    tagline: "Salesforce Marketing Cloud orchestration, Pardot lead nurturing, Journey Builder design, and Sales Cloud sync.",
    overview: [
      "Salesforce Marketing Cloud (SFMC) and Salesforce Account Engagement (formerly Pardot) are enterprise platforms requiring deep architectural expertise to configure properly. We build scalable marketing automations within the Salesforce ecosystem.",
      "We design multi-channel customer journeys in Journey Builder, establish robust data extensions, and configure the Salesforce bi-directional connector. We help enterprise marketing teams unlock the full power of their Salesforce investment."
    ],
    deliverablesTitle: "Salesforce Deliverables",
    deliverables: [
      "Journey Builder multi-channel customer journey design across email, SMS, and mobile push notifications",
      "Data Extension modeling, SQL query activities, and Contact Builder attribute group structuring",
      "Salesforce Marketing Cloud Connect integration maintaining bi-directional sync with Sales Cloud",
      "Pardot lead assignment automation, dynamic content rules, and engagement studio drip programs",
      "Email Studio responsive AMPscript template development for personalized dynamic email content"
    ],
    processTitle: "Salesforce Implementation Process",
    process: [
      { step: 1, title: "Data Architecture Audit", description: "Reviewing Contact Builder data models, subscriber keys, and Sales Cloud synchronization health." },
      { step: 2, title: "Automation Studio & SQL Setup", description: "Writing automated SQL query activities to segment and refresh target audience data extensions." },
      { step: 3, title: "Journey Builder Execution", description: "Constructing multi-branch customer journeys with entry criteria, decision splits, and wait activities." },
      { step: 4, title: "Connector Sync Validation", description: "Verifying that journey milestones, unsubscribes, and lead scores reflect accurately in Sales Cloud." }
    ],
    faqs: [
      { question: "What is the difference between Salesforce Marketing Cloud and Pardot?", answer: "Pardot (Account Engagement) is designed for B2B lead generation and nurture, while Marketing Cloud excels at high-volume B2C multi-channel messaging." },
      { question: "What is AMPscript in Salesforce Marketing Cloud?", answer: "AMPscript is Salesforce's proprietary scripting language used to embed dynamic, personalized customer data into email templates." },
      { question: "How do you prevent data sync bottlenecks between Marketing Cloud and Sales Cloud?", answer: "We optimize synchronized data extensions, filtering out unnecessary historical fields and setting appropriate sync polling intervals." }
    ]
  },
  "/automation/channel-partner-pipeline": {
    metaDescription: "Channel partner pipeline and portal automation from Beetrix360. We automate partner onboarding, deal registration, and co-marketing workflows.",
    tagline: "Partner relationship management (PRM), deal registration automation, and channel sales enablement.",
    overview: [
      "Scaling revenue through indirect sales channels, distributors, and referral partners requires seamless deal registration and partner enablement. We design automated channel partner pipelines that simplify collaboration between vendors and partners.",
      "Our partner automations handle partner onboarding, deal conflict protection, co-branded asset delivery, and commission calculations. We help businesses expand indirect revenue without creating administrative gridlock for channel managers."
    ],
    deliverablesTitle: "Channel Partner Deliverables",
    deliverables: [
      "Automated partner onboarding workflows providing immediate portal access, agreements, and training",
      "Deal registration approval workflows protecting partner exclusivity and eliminating sales conflicts",
      "Automated co-marketing collateral generation embedding partner logos into sales presentations",
      "Partner commission tier calculation and payout synchronization with billing systems",
      "Channel manager performance dashboard tracking partner pipeline velocity and deal close rates"
    ],
    processTitle: "Channel Pipeline Architecture",
    process: [
      { step: 1, title: "Partner Program Mapping", description: "Defining partner tiers, onboarding requirements, commission structures, and deal registration rules." },
      { step: 2, title: "Portal & Registration Setup", description: "Building frictionless deal registration forms with automated conflict-checking algorithms." },
      { step: 3, title: "Automated Enablement Triggers", description: "Configuring automated email sequences delivering product training and marketing playbooks to partners." },
      { step: 4, title: "Pipeline Tracking Integration", description: "Connecting partner deals into core CRM forecasting to provide executive visibility into indirect revenue." }
    ],
    faqs: [
      { question: "How does automated deal registration prevent channel partner conflict?", answer: "The system checks incoming deals against existing opportunities by domain and location, granting exclusivity to the first registering partner." },
      { question: "What features should a modern Partner Relationship Management (PRM) system include?", answer: "Key features include deal registration, lead distribution, co-branded marketing collateral, commission tracking, and resource libraries." },
      { question: "How do automated onboarding sequences improve partner activation?", answer: "Automated workflows guide new partners through onboarding modules, portal logins, and sales playbooks immediately upon signing." }
    ]
  }
};
