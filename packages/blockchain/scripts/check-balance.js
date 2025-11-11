const hre = require("hardhat");

async function main() {
  const wallet = "0x25Dd6346FE82E51001a9430CF07e8DeB84933627";
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  console.log("\n🔍 Verificando Balance...");
  console.log("========================");

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Get balance
  const balance = await token.balanceOf(wallet);
  console.log(`\nWallet: ${wallet}`);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} SEMILLA`);
  console.log(`Balance (wei): ${balance.toString()}`);

  // Get token info
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();

  console.log(`\n📊 Token Info:`);
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatEther(totalSupply)} SEMILLA`);

  console.log(`\n🔗 Links:`);
  console.log(`Contract: https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log(`Wallet: https://amoy.polygonscan.com/address/${wallet}`);
  console.log(`Token holdings: https://amoy.polygonscan.com/token/${contractAddress}?a=${wallet}`);

  if (balance > 0) {
    console.log(`\n✅ Balance confirmado on-chain: ${hre.ethers.formatEther(balance)} SEMILLA`);
    console.log(`\n💼 Para ver en MetaMask:`);
    console.log(`1. Cambiar a red: Polygon Amoy`);
    console.log(`   - Network name: Polygon Amoy Testnet`);
    console.log(`   - RPC URL: https://rpc-amoy.polygon.technology`);
    console.log(`   - Chain ID: 80002`);
    console.log(`   - Currency: POL`);
    console.log(`2. Click "Import tokens" o "Importar tokens"`);
    console.log(`3. Token address: ${contractAddress}`);
    console.log(`4. Click "Add"`);
  } else {
    console.log(`\n❌ Balance es 0. Algo salió mal con el mint.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
