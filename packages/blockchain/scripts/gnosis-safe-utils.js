/**
 * Gnosis Safe Utility Functions
 *
 * Helper functions for interacting with Gnosis Safe multisig
 *
 * Usage:
 *   node scripts/gnosis-safe-utils.js check-safe <SAFE_ADDRESS>
 *   node scripts/gnosis-safe-utils.js propose-mint <SAFE_ADDRESS> <TO> <AMOUNT>
 *   node scripts/gnosis-safe-utils.js check-roles <SAFE_ADDRESS>
 */

const hre = require('hardhat');
const { ethers } = hre;

const SEMILLA_TOKEN_ADDRESS = process.env.SEMILLA_TOKEN_AMOY || '0x8a3b2D350890e23D5679a899070B462DfFEe0643';

// Safe SDK would be imported here for production
// const Safe = require('@safe-global/protocol-kit');
// const SafeApiKit = require('@safe-global/api-kit');

async function checkSafe(safeAddress) {
  try {
    console.log('🔍 Checking Gnosis Safe');
    console.log('=====================\n');
    console.log(`Safe Address: ${safeAddress}`);
    console.log(`Network: ${hre.network.name}\n`);

    // Get Safe contract (using basic contract interface)
    const safeAbi = [
      'function getOwners() view returns (address[])',
      'function getThreshold() view returns (uint256)',
      'function isOwner(address owner) view returns (bool)',
    ];

    const safe = await ethers.getContractAt(safeAbi, safeAddress);

    // Get owners
    const owners = await safe.getOwners();
    const threshold = await safe.getThreshold();

    console.log('👥 Owners:');
    owners.forEach((owner, index) => {
      console.log(`   ${index + 1}. ${owner}`);
    });

    console.log(`\n🔐 Threshold: ${threshold} of ${owners.length} signatures required\n`);

    // Check SemillaToken roles
    const token = await ethers.getContractAt('SemillaToken', SEMILLA_TOKEN_ADDRESS);

    const MINTER_ROLE = await token.MINTER_ROLE();
    const PAUSER_ROLE = await token.PAUSER_ROLE();
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

    const hasMinterRole = await token.hasRole(MINTER_ROLE, safeAddress);
    const hasPauserRole = await token.hasRole(PAUSER_ROLE, safeAddress);
    const hasAdminRole = await token.hasRole(DEFAULT_ADMIN_ROLE, safeAddress);

    console.log('📋 SemillaToken Roles:');
    console.log(`   MINTER_ROLE: ${hasMinterRole ? '✅' : '❌'}`);
    console.log(`   PAUSER_ROLE: ${hasPauserRole ? '✅' : '❌'}`);
    console.log(`   ADMIN_ROLE: ${hasAdminRole ? '✅' : '❌'}\n`);

    if (hasMinterRole && hasPauserRole && hasAdminRole) {
      console.log('✅ Safe is fully configured with all roles!');
    } else {
      console.log('⚠️  Safe is missing some roles. Run transfer-ownership script.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function checkRoles(safeAddress) {
  try {
    console.log('🔍 Checking All Roles on SemillaToken');
    console.log('=====================================\n');
    console.log(`Token: ${SEMILLA_TOKEN_ADDRESS}`);
    console.log(`Network: ${hre.network.name}\n`);

    const token = await ethers.getContractAt('SemillaToken', SEMILLA_TOKEN_ADDRESS);

    const MINTER_ROLE = await token.MINTER_ROLE();
    const PAUSER_ROLE = await token.PAUSER_ROLE();
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

    console.log('📋 Role Definitions:');
    console.log(`   MINTER_ROLE: ${MINTER_ROLE}`);
    console.log(`   PAUSER_ROLE: ${PAUSER_ROLE}`);
    console.log(`   DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}\n`);

    const [deployer] = await ethers.getSigners();

    console.log('🔐 Role Assignments:\n');

    // Check Safe
    console.log(`Safe (${safeAddress}):`);
    console.log(`   MINTER: ${await token.hasRole(MINTER_ROLE, safeAddress) ? '✅' : '❌'}`);
    console.log(`   PAUSER: ${await token.hasRole(PAUSER_ROLE, safeAddress) ? '✅' : '❌'}`);
    console.log(`   ADMIN: ${await token.hasRole(DEFAULT_ADMIN_ROLE, safeAddress) ? '✅' : '❌'}\n`);

    // Check deployer
    console.log(`Deployer (${deployer.address}):`);
    console.log(`   MINTER: ${await token.hasRole(MINTER_ROLE, deployer.address) ? '⚠️  YES (should be NO)' : '✅ NO'}`);
    console.log(`   PAUSER: ${await token.hasRole(PAUSER_ROLE, deployer.address) ? '⚠️  YES (should be NO)' : '✅ NO'}`);
    console.log(`   ADMIN: ${await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address) ? '⚠️  YES (should be NO)' : '✅ NO'}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function proposeMint(safeAddress, toAddress, amount) {
  try {
    console.log('💰 Preparing Mint Proposal for Gnosis Safe');
    console.log('=========================================\n');

    const token = await ethers.getContractAt('SemillaToken', SEMILLA_TOKEN_ADDRESS);

    // Convert amount to wei (18 decimals)
    const amountWei = ethers.parseEther(amount.toString());

    console.log(`Safe: ${safeAddress}`);
    console.log(`To: ${toAddress}`);
    console.log(`Amount: ${amount} SEMILLA (${amountWei} wei)\n`);

    // Encode the mint function call
    const mintData = token.interface.encodeFunctionData('mint', [toAddress, amountWei]);

    console.log('📝 Transaction Data:');
    console.log('===================\n');
    console.log(`To (Contract): ${SEMILLA_TOKEN_ADDRESS}`);
    console.log(`Value: 0`);
    console.log(`Data: ${mintData}\n`);

    console.log('📋 Steps to execute via Gnosis Safe UI:\n');
    console.log('1. Go to: https://app.safe.global/');
    console.log('2. Select your Safe');
    console.log('3. Click "New Transaction" → "Contract Interaction"');
    console.log(`4. Enter contract address: ${SEMILLA_TOKEN_ADDRESS}`);
    console.log('5. Load ABI (or paste from SemillaToken.abi.json)');
    console.log('6. Select function: mint');
    console.log(`7. Parameters:`);
    console.log(`   - to: ${toAddress}`);
    console.log(`   - amount: ${amountWei}`);
    console.log('8. Submit and collect signatures');
    console.log('9. Execute when threshold reached\n');

    console.log('💡 Or use this raw transaction data:');
    console.log(JSON.stringify({
      to: SEMILLA_TOKEN_ADDRESS,
      value: '0',
      data: mintData,
    }, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function proposeEmergencyPause(safeAddress) {
  try {
    console.log('🚨 Preparing Emergency Pause Proposal');
    console.log('====================================\n');

    const token = await ethers.getContractAt('SemillaToken', SEMILLA_TOKEN_ADDRESS);

    // Encode pause function call
    const pauseData = token.interface.encodeFunctionData('emergencyPause', [
      'Manual pause via Gnosis Safe',
    ]);

    console.log(`Safe: ${safeAddress}\n`);

    console.log('📝 Transaction Data:');
    console.log('===================\n');
    console.log(`To (Contract): ${SEMILLA_TOKEN_ADDRESS}`);
    console.log(`Value: 0`);
    console.log(`Data: ${pauseData}\n`);

    console.log('⚠️  EMERGENCY PAUSE - Use only in case of:');
    console.log('   - Security vulnerability detected');
    console.log('   - Suspicious activity');
    console.log('   - Smart contract bug found\n');

    console.log('📋 Execute via Gnosis Safe UI or use raw data:');
    console.log(JSON.stringify({
      to: SEMILLA_TOKEN_ADDRESS,
      value: '0',
      data: pauseData,
    }, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage:');
    console.log('  node gnosis-safe-utils.js check-safe <SAFE_ADDRESS>');
    console.log('  node gnosis-safe-utils.js check-roles <SAFE_ADDRESS>');
    console.log('  node gnosis-safe-utils.js propose-mint <SAFE_ADDRESS> <TO> <AMOUNT>');
    console.log('  node gnosis-safe-utils.js propose-pause <SAFE_ADDRESS>');
    process.exit(1);
  }

  switch (command) {
    case 'check-safe':
      if (!args[1]) {
        console.error('❌ Missing Safe address');
        process.exit(1);
      }
      await checkSafe(args[1]);
      break;

    case 'check-roles':
      if (!args[1]) {
        console.error('❌ Missing Safe address');
        process.exit(1);
      }
      await checkRoles(args[1]);
      break;

    case 'propose-mint':
      if (!args[1] || !args[2] || !args[3]) {
        console.error('❌ Usage: propose-mint <SAFE_ADDRESS> <TO> <AMOUNT>');
        process.exit(1);
      }
      await proposeMint(args[1], args[2], args[3]);
      break;

    case 'propose-pause':
      if (!args[1]) {
        console.error('❌ Missing Safe address');
        process.exit(1);
      }
      await proposeEmergencyPause(args[1]);
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
