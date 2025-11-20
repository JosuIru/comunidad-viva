/**
 * Deploy WrappedSEMILLA to Polygon Mainnet
 *
 * This script deploys the WrappedSEMILLA (wSEMILLA) ERC20 token to Polygon mainnet
 * for bridging SEMILLA from the internal Gailu blockchain.
 *
 * Prerequisites:
 * - MATIC for gas fees in deployer wallet
 * - Gnosis Safe created on Polygon mainnet
 * - Private key configured in .env
 * - Polygonscan API key for verification
 *
 * Usage:
 *   # Dry run (estimate gas)
 *   DRY_RUN=true npx hardhat run scripts/deploy-polygon-mainnet.js --network polygon
 *
 *   # Actual deployment
 *   npx hardhat run scripts/deploy-polygon-mainnet.js --network polygon
 *
 * IMPORTANT: This deploys to MAINNET and costs real MATIC
 */

const hre = require('hardhat');
const { ethers } = hre;
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  console.log('🚀 Polygon Mainnet Deployment: WrappedSEMILLA');
  console.log('============================================\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No actual deployment\n');
  } else {
    console.log('🔴 LIVE DEPLOYMENT - Real MATIC will be spent\n');
  }

  const network = hre.network.name;
  console.log(`Network: ${network}`);

  if (network !== 'polygon' && !DRY_RUN) {
    console.error('❌ This script is for Polygon mainnet only!');
    console.error('   Use --network polygon');
    process.exit(1);
  }

  // Get deployment info
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceMatic = ethers.formatEther(balance);

  console.log(`Balance: ${balanceMatic} MATIC\n`);

  if (parseFloat(balanceMatic) < 0.1) {
    console.error('❌ Insufficient MATIC balance');
    console.error('   Need at least 0.1 MATIC for deployment and gas');
    process.exit(1);
  }

  // Get Gnosis Safe address
  const gnosisSafeAddress = process.env.GNOSIS_SAFE_POLYGON_MAINNET;

  if (!gnosisSafeAddress) {
    console.error('❌ GNOSIS_SAFE_POLYGON_MAINNET not configured in .env');
    console.error('   Create a Gnosis Safe first: https://app.safe.global/');
    process.exit(1);
  }

  console.log(`Gnosis Safe: ${gnosisSafeAddress}\n`);

  // Verify Safe exists
  const safeCode = await ethers.provider.getCode(gnosisSafeAddress);
  if (safeCode === '0x') {
    console.error('❌ Gnosis Safe address has no contract code');
    console.error('   Make sure the Safe is deployed on Polygon mainnet');
    process.exit(1);
  }

  console.log('✅ Gnosis Safe verified\n');

  // Get gas price
  const feeData = await ethers.provider.getFeeData();
  const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');

  console.log('⛽ Gas Information:');
  console.log(`   Gas Price: ${gasPriceGwei} Gwei`);
  console.log(`   Max Fee: ${ethers.formatUnits(feeData.maxFeePerGas || feeData.gasPrice, 'gwei')} Gwei`);
  console.log(`   Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, 'gwei')} Gwei\n`);

  // Estimate deployment cost
  const estimatedGas = 2000000; // Estimated gas for deployment
  const estimatedCostWei = feeData.gasPrice * BigInt(estimatedGas);
  const estimatedCostMatic = ethers.formatEther(estimatedCostWei);

  console.log(`📊 Estimated Deployment Cost: ${estimatedCostMatic} MATIC\n`);

  if (DRY_RUN) {
    console.log('✅ Dry run complete. Ready to deploy.');
    console.log('\n📋 Next steps:');
    console.log('1. Ensure you have enough MATIC for gas');
    console.log('2. Run without DRY_RUN=true to deploy');
    console.log('3. Verify contract on Polygonscan');
    console.log('4. Transfer ownership to Gnosis Safe');
    return;
  }

  // Confirm deployment
  console.log('⚠️  FINAL CONFIRMATION REQUIRED\n');
  console.log('You are about to deploy to Polygon MAINNET');
  console.log(`Estimated cost: ${estimatedCostMatic} MATIC\n`);

  const AUTO_CONFIRM = process.env.AUTO_CONFIRM === 'true';

  if (!AUTO_CONFIRM) {
    console.log('Set AUTO_CONFIRM=true in environment to proceed');
    console.log('Example: AUTO_CONFIRM=true npx hardhat run ...\n');
    process.exit(0);
  }

  console.log('🚀 Starting deployment...\n');

  // Deploy WrappedSEMILLA
  const WrappedSEMILLA = await ethers.getContractFactory('WrappedSEMILLA');

  console.log('📝 Deploying WrappedSEMILLA...');
  console.log(`   Admin: ${gnosisSafeAddress}`);
  console.log(`   Bridge Operator: ${deployer.address} (temporary)\n`);

  const wrappedSemilla = await WrappedSEMILLA.deploy(
    gnosisSafeAddress, // admin (Gnosis Safe)
    deployer.address,  // initial bridge operator (will transfer to backend later)
  );

  console.log('⏳ Waiting for deployment...');
  await wrappedSemilla.waitForDeployment();

  const contractAddress = await wrappedSemilla.getAddress();

  console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('=========================\n');
  console.log(`Contract: ${contractAddress}`);
  console.log(`Network: Polygon Mainnet`);
  console.log(`Admin: ${gnosisSafeAddress}`);
  console.log(`Bridge Operator: ${deployer.address}\n`);

  // Get deployment transaction
  const deployTx = wrappedSemilla.deploymentTransaction();
  console.log(`Deploy Tx Hash: ${deployTx?.hash}`);
  console.log(`Block: ${deployTx?.blockNumber}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: 'polygon-mainnet',
    contractAddress,
    deployerAddress: deployer.address,
    gnosisSafeAddress,
    deploymentTxHash: deployTx?.hash,
    blockNumber: deployTx?.blockNumber,
    timestamp: new Date().toISOString(),
    gasUsed: deployTx?.gasLimit?.toString(),
    gasPrice: deployTx?.gasPrice?.toString(),
  };

  const deploymentPath = path.join(__dirname, '../deployments/polygon-mainnet-wsemilla.json');
  const deploymentDir = path.dirname(deploymentPath);

  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`📄 Deployment info saved to: ${deploymentPath}\n`);

  // Verify on Polygonscan
  console.log('📋 Next steps:\n');
  console.log('1. Verify contract on Polygonscan:');
  console.log(`   npx hardhat verify --network polygon ${contractAddress} "${gnosisSafeAddress}" "${deployer.address}"\n`);

  console.log('2. Add bridge operator (backend wallet):');
  console.log('   - Via Gnosis Safe UI');
  console.log(`   - Call: addBridgeOperator(<BACKEND_WALLET_ADDRESS>)\n`);

  console.log('3. Update .env variables:');
  console.log(`   POLYGON_WSEMILLA_ADDRESS=${contractAddress}\n`);

  console.log('4. Test bridge:');
  console.log('   - Lock SEMILLA on internal chain');
  console.log('   - Mint wSEMILLA on Polygon');
  console.log('   - Verify balance\n');

  console.log('🔗 View on Polygonscan:');
  console.log(`   https://polygonscan.com/address/${contractAddress}\n`);

  console.log('✅ Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
