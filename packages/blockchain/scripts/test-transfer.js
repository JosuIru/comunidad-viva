const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  // From: Josu wallet (tu wallet con 55 SEMILLA)
  // To: Test wallet
  const fromWallet = "0xe88952fa33112ec58c83dae2974c0fef679b553d";
  const toWallet = "0x25Dd6346FE82E51001a9430CF07e8DeB84933627";

  console.log("\n🔄 Testing Token Transfer");
  console.log("=========================");
  console.log("Contract:", contractAddress);
  console.log("From:", fromWallet);
  console.log("To:", toWallet);

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Get balances before
  const balanceFromBefore = await token.balanceOf(fromWallet);
  const balanceToBefore = await token.balanceOf(toWallet);

  console.log("\n💰 Balances Before Transfer:");
  console.log("From (Josu):", hre.ethers.formatEther(balanceFromBefore), "SEMILLA");
  console.log("To (Test):", hre.ethers.formatEther(balanceToBefore), "SEMILLA");

  // Transfer 10 SEMILLA
  const amount = hre.ethers.parseEther("10");
  console.log("\n🔨 Transferring", hre.ethers.formatEther(amount), "SEMILLA...");

  const tx = await token.transfer(toWallet, amount);
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block", receipt.blockNumber);

  // Get balances after
  const balanceFromAfter = await token.balanceOf(fromWallet);
  const balanceToAfter = await token.balanceOf(toWallet);

  console.log("\n💰 Balances After Transfer:");
  console.log("From (Josu):", hre.ethers.formatEther(balanceFromAfter), "SEMILLA");
  console.log("To (Test):", hre.ethers.formatEther(balanceToAfter), "SEMILLA");

  // Verify transfer
  const expectedFrom = balanceFromBefore - amount;
  const expectedTo = balanceToBefore + amount;

  console.log("\n✅ Verification:");
  console.log("From change:", hre.ethers.formatEther(balanceFromBefore - balanceFromAfter), "SEMILLA (expected: -10)");
  console.log("To change:", hre.ethers.formatEther(balanceToAfter - balanceToBefore), "SEMILLA (expected: +10)");

  if (balanceFromAfter === expectedFrom && balanceToAfter === expectedTo) {
    console.log("\n🎉 SUCCESS: Transfer worked perfectly!");
  } else {
    console.log("\n❌ ERROR: Balances don't match expected values");
  }

  console.log("\n🔗 View transaction:");
  console.log("https://amoy.polygonscan.com/tx/" + tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Transfer failed:");
    console.error(error);
    process.exit(1);
  });
