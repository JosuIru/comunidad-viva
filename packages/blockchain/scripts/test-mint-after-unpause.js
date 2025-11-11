const hre = require("hardhat");

async function main() {
  const testWallet = "0xe88952fa33112ec58c83dae2974c0fef679b553d";
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  console.log("\n🧪 Testing Mint After Unpause");
  console.log("=============================");
  console.log("This SHOULD SUCCEED - contract is unpaused");

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Verificar que NO está pausado
  const isPaused = await token.paused();
  console.log("\nContract paused:", isPaused);

  if (isPaused) {
    console.log("\n⚠️  Contract is still PAUSED!");
    console.log("Run emergency-unpause.js first");
    process.exit(1);
  }

  console.log("✅ Contract is unpaused");

  // Ver balance actual
  const balanceBefore = await token.balanceOf(testWallet);
  console.log(`\nBalance before: ${hre.ethers.formatEther(balanceBefore)} SEMILLA`);

  console.log("\n🔨 Minting 5 SEMILLA...");
  console.log("(This should SUCCEED)");

  try {
    const amount = hre.ethers.parseEther("5");
    const tx = await token.mint(testWallet, amount);
    console.log("⏳ Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");

    await tx.wait();
    console.log("✅ Transaction confirmed!");

    // Ver nuevo balance
    const balanceAfter = await token.balanceOf(testWallet);
    console.log(`\nBalance after: ${hre.ethers.formatEther(balanceAfter)} SEMILLA`);
    console.log(`Difference: +${hre.ethers.formatEther(amount)} SEMILLA`);

    console.log("\n🎉 SUCCESS: Contract is working normally after unpause!");
    process.exit(0);
  } catch (error) {
    console.log("\n❌ ERROR: Mint failed when it should have succeeded!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script error:");
    console.error(error);
    process.exit(1);
  });
