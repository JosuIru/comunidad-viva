const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";
  const reason = process.env.PAUSE_REASON || "Issue resolved, resuming operations";

  console.log("\n✅ EMERGENCY UNPAUSE");
  console.log("====================");
  console.log("Contract:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Reason:", reason);

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Verificar que esté pausado
  const isPaused = await token.paused();
  if (!isPaused) {
    console.log("\n✅ Contract is not paused!");
    console.log("No action needed.");
    process.exit(0);
  }

  console.log("\n⚠️  WARNING: You are about to UNPAUSE the contract");
  console.log("Make sure you have:");
  console.log("1. ✅ Investigated and resolved the issue");
  console.log("2. ✅ Documented the incident");
  console.log("3. ✅ Verified it's safe to resume operations");

  console.log("\n🔨 Unpausing contract...");
  const tx = await token.unpause();
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block", receipt.blockNumber);

  // Verificar que se despausó correctamente
  const isPausedNow = await token.paused();
  console.log("\n✅ Contract is now UNPAUSED:", !isPausedNow);

  console.log("\n✅ All operations (transfers, mints, burns) are now ENABLED");

  console.log("\n🔗 View on explorer:");
  console.log("https://amoy.polygonscan.com/tx/" + tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error during unpause:");
    console.error(error);
    process.exit(1);
  });
