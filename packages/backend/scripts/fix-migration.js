#!/usr/bin/env node
/**
 * Script to fix failed Prisma migration
 * This resolves the migration state and pushes the schema
 */

const { execSync } = require('child_process');

console.log('=== Fixing Failed Migration ===\n');

try {
  // Step 1: Mark the failed migration as resolved
  console.log('Step 1: Resolving failed migration...');
  try {
    execSync(
      'npx prisma migrate resolve --applied 20251120000000_add_social_integrations',
      { stdio: 'inherit', cwd: __dirname + '/..' }
    );
    console.log('✓ Migration resolved\n');
  } catch (e) {
    console.log('⚠️  Could not resolve migration (may not exist)\n');
  }

  // Step 2: Push schema to database (creates missing tables)
  console.log('Step 2: Pushing schema to database...');
  execSync(
    'npx prisma db push --accept-data-loss --skip-generate',
    { stdio: 'inherit', cwd: __dirname + '/..' }
  );
  console.log('✓ Schema pushed\n');

  console.log('✅ Migration fixed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error fixing migration:', error.message);
  process.exit(1);
}
