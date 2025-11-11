const hre = require("hardhat");

async function main() {
  const josuWallet = "0xe88952fa33112ec58c83dae2974c0fef679b553d";
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  console.log("\n🎯 Minting SEMILLA to Josu's Real Wallet");
  console.log("==========================================");
  console.log("Contract:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Recipient:", josuWallet);

  const SemillaToken = await hre.ethers.getContractFactory("SemillaToken");
  const token = await SemillaToken.attach(contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log("\nMinting from:", deployer.address);

  // Check current balance
  const balanceBefore = await token.balanceOf(josuWallet);
  console.log("\nBalance anterior:", hre.ethers.formatEther(balanceBefore), "SEMILLA");

  // Mint 50 SEMILLA
  const amount = hre.ethers.parseEther("50");
  console.log("\n🔨 Minting", hre.ethers.formatEther(amount), "SEMILLA...");

  const tx = await token.mint(josuWallet, amount);
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("Esperando confirmación...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block", receipt.blockNumber);

  // Check new balance
  const balanceAfter = await token.balanceOf(josuWallet);
  console.log("\n💰 Balance nuevo:", hre.ethers.formatEther(balanceAfter), "SEMILLA");

  // Check total supply
  const totalSupply = await token.totalSupply();
  console.log("📊 Total Supply:", hre.ethers.formatEther(totalSupply), "SEMILLA");

  console.log("\n🎉 ¡Mint exitoso!");
  console.log("\n📝 Para ver en MetaMask:");
  console.log("1. Asegúrate que estás en red Polygon Amoy");
  console.log("2. Click 'Import tokens'");
  console.log("3. Pegar:", contractAddress);
  console.log("4. Verás: 50 SEMILLA");

  console.log("\n🔗 Links:");
  console.log("Transaction: https://amoy.polygonscan.com/tx/" + tx.hash);
  console.log("Tu wallet: https://amoy.polygonscan.com/address/" + josuWallet);
  console.log("Tu balance: https://amoy.polygonscan.com/token/" + contractAddress + "?a=" + josuWallet);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error durante mint:");
    console.error(error);
    process.exit(1);
  });
