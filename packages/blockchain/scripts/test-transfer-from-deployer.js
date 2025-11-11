const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  // We'll mint to deployer first, then transfer
  const [deployer] = await hre.ethers.getSigners();
  const toWallet = "0xe88952fa33112ec58c83dae2974c0fef679b553d"; // Josu wallet

  console.log("\n🔄 Testing Token Transfer (Deployer Demo)");
  console.log("==========================================");
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("To:", toWallet);

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Step 1: Mint 10 SEMILLA to deployer
  console.log("\n📝 Step 1: Minting 10 SEMILLA to deployer...");
  const mintAmount = hre.ethers.parseEther("10");
  const mintTx = await token.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("✅ Minted 10 SEMILLA to deployer");

  // Get balances before transfer
  const balanceDeployerBefore = await token.balanceOf(deployer.address);
  const balanceToBefore = await token.balanceOf(toWallet);

  console.log("\n💰 Balances Before Transfer:");
  console.log("Deployer:", hre.ethers.formatEther(balanceDeployerBefore), "SEMILLA");
  console.log("Josu:", hre.ethers.formatEther(balanceToBefore), "SEMILLA");

  // Step 2: Transfer from deployer to Josu
  console.log("\n📝 Step 2: Transferring 10 SEMILLA to Josu...");
  const transferAmount = hre.ethers.parseEther("10");
  const transferTx = await token.transfer(toWallet, transferAmount);
  console.log("⏳ Transaction sent:", transferTx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await transferTx.wait();
  console.log("✅ Transaction confirmed in block", receipt.blockNumber);

  // Get balances after transfer
  const balanceDeployerAfter = await token.balanceOf(deployer.address);
  const balanceToAfter = await token.balanceOf(toWallet);

  console.log("\n💰 Balances After Transfer:");
  console.log("Deployer:", hre.ethers.formatEther(balanceDeployerAfter), "SEMILLA");
  console.log("Josu:", hre.ethers.formatEther(balanceToAfter), "SEMILLA");

  // Verify transfer
  console.log("\n✅ Verification:");
  console.log("Deployer change:", hre.ethers.formatEther(balanceDeployerBefore - balanceDeployerAfter), "SEMILLA (expected: -10)");
  console.log("Josu change:", hre.ethers.formatEther(balanceToAfter - balanceToBefore), "SEMILLA (expected: +10)");

  const expectedDeployer = balanceDeployerBefore - transferAmount;
  const expectedTo = balanceToBefore + transferAmount;

  if (balanceDeployerAfter === expectedDeployer && balanceToAfter === expectedTo) {
    console.log("\n🎉 SUCCESS: Transfer worked perfectly!");
    console.log("\nThis confirms:");
    console.log("✅ ERC20 transfer function works");
    console.log("✅ Balances update correctly");
    console.log("✅ Users can send tokens to each other");
  } else {
    console.log("\n❌ ERROR: Balances don't match expected values");
  }

  console.log("\n🔗 View transaction:");
  console.log("https://amoy.polygonscan.com/tx/" + transferTx.hash);

  console.log("\n📝 Note:");
  console.log("For users to transfer from their own wallets,");
  console.log("they would use MetaMask or another wallet app.");
  console.log("This script demonstrates that the transfer function works.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Transfer test failed:");
    console.error(error);
    process.exit(1);
  });
