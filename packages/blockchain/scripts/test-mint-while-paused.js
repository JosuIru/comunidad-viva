const hre = require("hardhat");

async function main() {
  const testWallet = "0xe88952fa33112ec58c83dae2974c0fef679b553d";
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  console.log("\n🧪 Testing Mint While Paused");
  console.log("============================");
  console.log("This SHOULD FAIL - contract is paused");

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Verificar que está pausado
  const isPaused = await token.paused();
  console.log("\nContract paused:", isPaused);

  if (!isPaused) {
    console.log("\n⚠️  Contract is NOT paused!");
    console.log("Run emergency-pause.js first");
    process.exit(1);
  }

  console.log("\n🔨 Attempting to mint 10 SEMILLA...");
  console.log("(This should FAIL with 'EnforcedPause' error)");

  try {
    const amount = hre.ethers.parseEther("10");
    const tx = await token.mint(testWallet, amount);
    await tx.wait();

    console.log("\n❌ ERROR: Mint succeeded when it should have failed!");
    console.log("Contract pause is NOT working correctly!");
    process.exit(1);
  } catch (error) {
    if (error.message.includes("EnforcedPause") ||
        error.message.includes("paused") ||
        error.message.includes("execution reverted")) {
      console.log("\n✅ SUCCESS: Mint correctly FAILED while paused");
      console.log("Error:", error.message.includes("reverted") ? "execution reverted (contract is paused)" : error.message.split('\n')[0]);
      console.log("\n🎉 Pause functionality is working correctly!");
      process.exit(0);
    } else {
      console.log("\n❌ Unexpected error:");
      console.error(error);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script error:");
    console.error(error);
    process.exit(1);
  });
