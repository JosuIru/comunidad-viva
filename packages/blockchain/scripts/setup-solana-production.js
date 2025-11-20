/**
 * Setup Solana SPL Token for Production
 *
 * This script creates a new SPL Token on Solana for wSEMILLA
 *
 * Prerequisites:
 * - Solana CLI installed
 * - A keypair with SOL for transaction fees
 * - Network configured (devnet or mainnet-beta)
 *
 * Usage:
 *   node scripts/setup-solana-production.js --network devnet
 *   node scripts/setup-solana-production.js --network mainnet-beta
 */

const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} = require('@solana/web3.js');
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

// Configuration
const DECIMALS = 18; // Match SEMILLA decimals on internal chain
const TOKEN_NAME = 'Wrapped SEMILLA';
const TOKEN_SYMBOL = 'wSEMILLA';

async function setupSolanaToken() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const networkIndex = args.indexOf('--network');
    const network = networkIndex >= 0 ? args[networkIndex + 1] : 'devnet';

    if (!['devnet', 'mainnet-beta'].includes(network)) {
      console.error('❌ Invalid network. Use: devnet or mainnet-beta');
      process.exit(1);
    }

    console.log('🚀 Solana SPL Token Setup');
    console.log('========================\n');
    console.log(`Network: ${network}`);
    console.log(`Token: ${TOKEN_NAME} (${TOKEN_SYMBOL})`);
    console.log(`Decimals: ${DECIMALS}\n`);

    // Connect to Solana
    const connection = new Connection(
      network === 'mainnet-beta'
        ? process.env.SOLANA_MAINNET_RPC_URL || clusterApiUrl('mainnet-beta')
        : process.env.SOLANA_DEVNET_RPC_URL || clusterApiUrl('devnet'),
      'confirmed',
    );

    console.log('📡 Connected to Solana', network);

    // Load or generate authority keypair
    let authorityKeypair;
    const keypairPath = process.env.SOLANA_AUTHORITY_KEYPAIR_PATH ||
                       path.join(__dirname, `../keys/solana-authority-${network}.json`);

    if (fs.existsSync(keypairPath)) {
      console.log(`\n🔑 Loading authority keypair from: ${keypairPath}`);
      const secretKeyString = fs.readFileSync(keypairPath, 'utf-8');
      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      authorityKeypair = Keypair.fromSecretKey(secretKey);
    } else {
      console.log('\n🔑 Generating new authority keypair...');
      authorityKeypair = Keypair.generate();

      // Save keypair
      const keysDir = path.join(__dirname, '../keys');
      if (!fs.existsSync(keysDir)) {
        fs.mkdirSync(keysDir, { recursive: true });
      }

      fs.writeFileSync(
        keypairPath,
        JSON.stringify(Array.from(authorityKeypair.secretKey)),
      );

      console.log(`✅ Keypair saved to: ${keypairPath}`);
      console.log(`⚠️  IMPORTANT: Backup this file securely!`);
    }

    console.log(`Authority: ${authorityKeypair.publicKey.toBase58()}`);

    // Check SOL balance
    const balance = await connection.getBalance(authorityKeypair.publicKey);
    const solBalance = balance / 1e9;

    console.log(`\n💰 SOL Balance: ${solBalance.toFixed(4)} SOL`);

    if (solBalance < 0.01) {
      console.error('\n❌ Insufficient SOL balance');
      if (network === 'devnet') {
        console.log('\n💡 Get devnet SOL from:');
        console.log(`   solana airdrop 2 ${authorityKeypair.publicKey.toBase58()} --url devnet`);
        console.log('   or: https://faucet.solana.com/');
      } else {
        console.log('\n💡 You need to fund this address with SOL on mainnet');
      }
      process.exit(1);
    }

    // Check if mint already exists
    const existingMintStr = process.env[`SOLANA_SEMILLA_MINT_${network.toUpperCase().replace('-', '_')}`];

    if (existingMintStr) {
      console.log(`\n⚠️  Mint address already configured: ${existingMintStr}`);
      console.log('Verifying mint...');

      try {
        const existingMint = new PublicKey(existingMintStr);
        const mintInfo = await getMint(connection, existingMint);

        console.log('\n✅ Existing mint verified:');
        console.log(`   Address: ${existingMint.toBase58()}`);
        console.log(`   Decimals: ${mintInfo.decimals}`);
        console.log(`   Supply: ${mintInfo.supply.toString()}`);
        console.log(`   Mint Authority: ${mintInfo.mintAuthority?.toBase58() || 'None'}`);

        if (mintInfo.decimals !== DECIMALS) {
          console.error(`\n❌ Decimals mismatch! Expected ${DECIMALS}, got ${mintInfo.decimals}`);
          process.exit(1);
        }

        console.log('\n✅ Mint configuration is correct');
        return;
      } catch (error) {
        console.error('\n❌ Failed to verify existing mint:', error.message);
        console.log('Creating new mint...');
      }
    }

    // Create new mint
    console.log('\n🏭 Creating new SPL Token mint...');

    const mint = await createMint(
      connection,
      authorityKeypair,
      authorityKeypair.publicKey, // mint authority
      authorityKeypair.publicKey, // freeze authority
      DECIMALS,
    );

    console.log('\n🎉 SUCCESS! SPL Token created:');
    console.log('==============================');
    console.log(`Mint Address: ${mint.toBase58()}`);
    console.log(`Authority: ${authorityKeypair.publicKey.toBase58()}`);
    console.log(`Network: ${network}`);
    console.log(`Decimals: ${DECIMALS}`);

    // Update .env file
    console.log('\n📝 Environment Variables:');
    console.log('Add these to your .env file:\n');

    console.log(`SOLANA_RPC_URL=${network === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com'}`);
    console.log(`SOLANA_SEMILLA_MINT=${mint.toBase58()}`);
    console.log(`SOLANA_AUTHORITY_PRIVATE_KEY='${JSON.stringify(Array.from(authorityKeypair.secretKey))}'`);

    // Test mint
    console.log('\n🧪 Testing mint functionality...');

    const testAmount = 100 * Math.pow(10, DECIMALS); // 100 tokens

    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      mint,
      authorityKeypair.publicKey,
    );

    console.log(`Token Account: ${recipientTokenAccount.address.toBase58()}`);

    const mintSignature = await mintTo(
      connection,
      authorityKeypair,
      mint,
      recipientTokenAccount.address,
      authorityKeypair.publicKey,
      testAmount,
    );

    console.log(`\n✅ Test mint successful!`);
    console.log(`   Signature: ${mintSignature}`);
    console.log(`   Amount: 100 ${TOKEN_SYMBOL}`);

    // Verify on explorer
    const explorerUrl = network === 'mainnet-beta'
      ? `https://explorer.solana.com/address/${mint.toBase58()}`
      : `https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`;

    console.log(`\n🔍 View on Solana Explorer:`);
    console.log(`   ${explorerUrl}`);

    console.log('\n✅ Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Backup your keypair file securely');
    console.log('2. Add environment variables to .env');
    console.log('3. Test minting from backend service');
    console.log('4. For mainnet: Consider using a multisig for mint authority');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run setup
setupSolanaToken();
