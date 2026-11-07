Beetrix360 service pages, official brand colors

Colors: Pink #DE2056, Green #2CB383, Yellow #FAB12F, Blue #3ABEF9, Dark #0A0A0A

Each folder is one top-menu dropdown:
  pages/                  Finished HTML pages, one folder per URL
  preview-all-pages.html  Open in a browser to click through every page
  source/                 Editable files. Change them, then run: node build.js

To add your paragraphs: open source/text-content.js. Each line is ["Heading", "target keyword", "your paragraph"].
Type your paragraph into the third slot, then run node build.js.

Before going live:
  1. Fill the paragraph slots, or set HIDE_EMPTY to true in text-content.js so empty prompts are left out.
  2. Connect the lead forms to your form endpoint.
  3. Replace image placeholders with real images.
