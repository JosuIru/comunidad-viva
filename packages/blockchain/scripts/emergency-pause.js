const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";
  const reason = process.env.PAUSE_REASON || "Emergency pause - investigating suspicious activity";

  console.log("\n⚠️  EMERGENCY PAUSE");
  console.log("==================");
  console.log("Contract:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Reason:", reason);

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Verificar que no esté ya pausado
  const isPaused = await token.paused();
  if (isPaused) {
    console.log("\n⚠️  Contract is already paused!");
    console.log("No action needed.");
    process.exit(0);
  }

  console.log("\n🔨 Pausing contract...");
  const tx = await token.pause(reason);
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block", receipt.blockNumber);

  // Verificar que se pausó correctamente
  const isPausedNow = await token.paused();
  console.log("\n✅ Contract is now PAUSED:", isPausedNow);

  console.log("\n⚠️  All transfers, mints, and burns are now DISABLED");
  console.log("\n📝 Next steps:");
  console.log("1. Investigate the issue");
  console.log("2. Document the incident");
  console.log("3. Determine if unpause is safe");
  console.log("4. To unpause: PAUSE_REASON='Issue resolved' npx hardhat run scripts/emergency-unpause.js --network", hre.network.name);

  console.log("\n🔗 View on explorer:");
  console.log("https://amoy.polygonscan.com/tx/" + tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error during emergency pause:");
    console.error(error);
    process.exit(1);
  });
