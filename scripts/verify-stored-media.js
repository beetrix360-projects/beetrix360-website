const path = require('path');
const createJiti = require('jiti');

const jiti = createJiti(__filename, {
  alias: {
    'server-only': path.resolve(__dirname, 'empty.js'),
    '@': path.resolve(__dirname, '../src'),
  },
  extensions: ['.js', '.mjs', '.cjs', '.ts', '.json'],
});

const {
  getPageMediaPlacements,
  getAllPageMediaGroups,
} = jiti(path.resolve(__dirname, '../src/lib/media-placements.ts'));

async function verify() {
  console.log('--- Verifying Stored Placements in Database ---');

  // 1. Verify Home Page
  const homePlacements = await getPageMediaPlacements('home');
  const homeConfigured = homePlacements.filter(p => p.isConfigured);
  console.log(`Home Page: ${homeConfigured.length} / ${homePlacements.length} slots configured.`);
  homePlacements.slice(0, 5).forEach(p => console.log(`  [${p.placeholderKey}] (${p.mediaType}) -> ${p.mediaUrl.slice(0, 65)}...`));

  // 2. Verify /web-design/ecommerce
  const ecomPlacements = await getPageMediaPlacements('web-design/ecommerce');
  const ecomConfigured = ecomPlacements.filter(p => p.isConfigured);
  console.log(`\n/web-design/ecommerce: ${ecomConfigured.length} / ${ecomPlacements.length} slots configured.`);
  ecomPlacements.slice(0, 5).forEach(p => console.log(`  [${p.placeholderKey}] (${p.mediaType}) -> ${p.mediaUrl.slice(0, 65)}...`));

  // 3. Verify /about
  const aboutPlacements = await getPageMediaPlacements('about');
  const aboutConfigured = aboutPlacements.filter(p => p.isConfigured);
  console.log(`\n/about: ${aboutConfigured.length} / ${aboutPlacements.length} slots configured.`);
  aboutPlacements.forEach(p => console.log(`  [${p.placeholderKey}] (${p.mediaType}) -> ${p.mediaUrl.slice(0, 65)}...`));

  // 4. Verify Admin Dashboard groups summary
  const groups = await getAllPageMediaGroups();
  const totalConfigured = groups.reduce((acc, g) => acc + g.configuredCount, 0);
  const totalSlots = groups.reduce((acc, g) => acc + g.totalCount, 0);
  console.log(`\nAdmin Dashboard Sync Summary:`);
  console.log(`  Total Groups: ${groups.length}`);
  console.log(`  Total Configured: ${totalConfigured} / ${totalSlots} (${Math.round((totalConfigured / totalSlots) * 100)}%)`);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});

