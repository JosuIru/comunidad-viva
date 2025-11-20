const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";
  const token = await hre.ethers.getContractAt("SemillaToken", tokenAddress);

  const [signer] = await hre.ethers.getSigners();

  console.log("🔍 Validating Amoy Deployment");
  console.log("==============================\n");
  console.log("Contract:", tokenAddress);
  console.log("Network:", hre.network.name);
  console.log("Signer:", signer.address, "\n");

  const MINTER_ROLE = await token.MINTER_ROLE();
  const PAUSER_ROLE = await token.PAUSER_ROLE();
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

  console.log("📋 Signer Roles:");
  const hasMinter = await token.hasRole(MINTER_ROLE, signer.address);
  const hasPauser = await token.hasRole(PAUSER_ROLE, signer.address);
  const hasAdmin = await token.hasRole(DEFAULT_ADMIN_ROLE, signer.address);

  console.log("  MINTER:", hasMinter ? "✅" : "❌");
  console.log("  PAUSER:", hasPauser ? "✅" : "❌");
  console.log("  ADMIN:", hasAdmin ? "✅" : "❌");

  const isPaused = await token.paused();
  console.log("\n⏸️  Paused:", isPaused ? "YES ⚠️" : "NO ✅");

  const totalSupply = await token.totalSupply();
  const maxSupply = await token.MAX_TOTAL_SUPPLY();
  const maxMint = await token.MAX_MINT_AMOUNT();

  console.log("\n📊 Supply Info:");
  console.log("  Total Supply:", hre.ethers.formatEther(totalSupply), "SEMILLA");
  console.log("  Max Supply:", hre.ethers.formatEther(maxSupply), "SEMILLA");
  console.log("  Max Mint:", hre.ethers.formatEther(maxMint), "SEMILLA");
  console.log("  Remaining:", hre.ethers.formatEther(maxSupply - totalSupply), "SEMILLA");

  // Test basic functionality
  console.log("\n🧪 Testing Functionality:\n");

  // Test 1: Can check balances
  try {
    const balance = await token.balanceOf(signer.address);
    console.log("✅ Balance check works:", hre.ethers.formatEther(balance), "SEMILLA");
  } catch (error) {
    console.log("❌ Balance check failed:", error.message);
  }

  // Test 2: Can check if paused
  try {
    const paused = await token.paused();
    console.log("✅ Pause state check works:", paused ? "PAUSED" : "ACTIVE");
  } catch (error) {
    console.log("❌ Pause check failed:", error.message);
  }

  // Test 3: Check name and symbol
  try {
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    console.log("✅ Token metadata works:", name, "(" + symbol + "),", decimals, "decimals");
  } catch (error) {
    console.log("❌ Metadata check failed:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("📋 VALIDATION SUMMARY");
  console.log("=".repeat(50) + "\n");

  const allGood = hasMinter && hasPauser && hasAdmin && !isPaused;

  if (allGood) {
    console.log("✅ All checks passed!");
    console.log("✅ Contract is ready for testing");
    console.log("✅ Signer has all necessary roles");
    console.log("✅ Contract is not paused");
    console.log("\n🎯 Ready to proceed with Solana devnet setup");
  } else {
    console.log("⚠️  Some checks failed:");
    if (!hasMinter) console.log("  - Missing MINTER role");
    if (!hasPauser) console.log("  - Missing PAUSER role");
    if (!hasAdmin) console.log("  - Missing ADMIN role");
    if (isPaused) console.log("  - Contract is paused");
    console.log("\n❌ Address issues before proceeding");
  }

  console.log("\n🔗 View on Polygonscan:");
  console.log(`   https://amoy.polygonscan.com/address/${tokenAddress}#code`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
