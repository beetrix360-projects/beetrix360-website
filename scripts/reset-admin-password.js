const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment from .env.local if present
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dataDir = path.join(process.cwd(), '.data');
  const storePath = path.join(dataDir, 'content-store.json');

  let store = {};
  if (fs.existsSync(storePath)) {
    try {
      store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    } catch {}
  }

  const userKeys = Object.keys(store).filter((k) => k.startsWith('USER:'));

  if (args.length === 0) {
    console.log('\n=== Beetrix360 Admin User Status ===');
    if (userKeys.length === 0) {
      console.log('No users found in local store (.data/content-store.json).');
      console.log('Run with arguments to create or reset an admin account:');
      console.log('  node scripts/reset-admin-password.js <email> <newPassword>\n');
    } else {
      console.log('Found ' + userKeys.length + ' user(s) in local store:');
      for (const k of userKeys) {
        const u = store[k];
        console.log(`  - Email: ${u.email} | Name: ${u.name} | Role: ${u.role} (Key: ${k})`);
      }
      console.log('\nTo reset password for any user:');
      console.log('  node scripts/reset-admin-password.js <email> <newPassword>\n');
    }
    return;
  }

  const email = (args[0] || 'admin@beetrix360.com').toLowerCase().trim();
  const newPassword = args[1];

  if (!newPassword || newPassword.trim().length === 0) {
    console.error('Error: Please provide a new password.');
    console.log('Usage: node scripts/reset-admin-password.js <email> <newPassword>');
    process.exit(1);
  }

  console.log(`\nUpdating password for user: ${email}...`);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword.trim(), salt);

  // Find existing record or create new one
  let targetKey = userKeys.find((k) => store[k]?.email?.toLowerCase() === email);
  if (!targetKey) {
    targetKey = 'USER:usr_initial_admin';
  }

  const existing = store[targetKey] || {
    id: 'usr_initial_admin',
    name: 'Master Administrator',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  existing.email = email;
  existing.passwordHash = hash;
  existing.updatedAt = new Date().toISOString();
  store[targetKey] = existing;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  console.log(`[Local Store] Successfully saved password for ${email} in .data/content-store.json`);

  // Also update DynamoDB if AWS environment is configured
  if (process.env.CONTENT_SOURCE === 'dynamodb' || process.env.DYNAMODB_CONTENT_TABLE) {
    try {
      const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
      const tableName = process.env.DYNAMODB_CONTENT_TABLE || 'Beetrix_Content';
      const region = process.env.DDB_REGION || process.env.AWS_REGION || 'us-east-1';

      const ddbClient = new DynamoDBClient({ region });
      const docClient = DynamoDBDocumentClient.from(ddbClient);

      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            pk: 'USER',
            sk: existing.id || 'usr_initial_admin',
            data: existing,
            updatedAt: new Date().toISOString(),
          },
        })
      );
      console.log(`[DynamoDB] Successfully updated user record in table "${tableName}"!`);
    } catch (err) {
      console.warn('[DynamoDB] Note: Could not update remote DynamoDB directly (AWS credentials not active in local terminal):', err.message);
    }
  }

  console.log('\n=== Success ===');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${newPassword.trim()}`);
  console.log('You can now log in at /admin/login\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
