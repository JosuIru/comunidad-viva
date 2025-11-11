const hre = require("hardhat");

async function main() {
  // Tu wallet address
  const josuWallet = "0x25Dd6346FE82E51001a9430CF07e8DeB84933627";

  // Contract deployed
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  console.log("\n🎯 Test Mint para Josu");
  console.log("======================");
  console.log(`Contract: ${contractAddress}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Recipient: ${josuWallet}`);

  // Connect to contract
  const SemillaToken = await hre.ethers.getContractFactory("SemillaToken");
  const token = await SemillaToken.attach(contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`\nMinting from: ${deployer.address}`);

  // Check if deployer still has MINTER_ROLE
  const MINTER_ROLE = await token.MINTER_ROLE();
  const hasMinterRole = await token.hasRole(MINTER_ROLE, deployer.address);

  console.log(`\nDeployer has MINTER_ROLE: ${hasMinterRole}`);

  if (!hasMinterRole) {
    console.log("\n❌ ERROR: Deployer no tiene MINTER_ROLE");
    console.log("\nEsto significa que:");
    console.log("1. Ya transferiste ownership al Gnosis Safe ✅");
    console.log("2. Debes usar Gnosis Safe para mintear");
    console.log("\nPara mintear desde Gnosis Safe:");
    console.log("1. Ir a https://app.safe.global/");
    console.log("2. Seleccionar tu Safe");
    console.log("3. New Transaction -> Contract Interaction");
    console.log(`4. Contract: ${contractAddress}`);
    console.log("5. Method: mint");
    console.log(`6. to: ${josuWallet}`);
    console.log("7. amount: 50000000000000000000 (50 SEMILLA)");
    console.log("8. Submit -> Aprobar con signers -> Execute");

    // Check current state
    console.log("\n📊 Estado actual del contrato:");
    const balance = await token.balanceOf(josuWallet);
    const totalSupply = await token.totalSupply();
    console.log(`Balance de Josu: ${hre.ethers.formatEther(balance)} SEMILLA`);
    console.log(`Total Supply: ${hre.ethers.formatEther(totalSupply)} SEMILLA`);

    process.exit(0);
  }

  // If deployer still has role, mint directly
  console.log("\n✅ Deployer tiene MINTER_ROLE. Procediendo con mint...");

  // Check current balance
  const balanceBefore = await token.balanceOf(josuWallet);
  console.log(`\nBalance anterior: ${hre.ethers.formatEther(balanceBefore)} SEMILLA`);

  // Mint 50 SEMILLA
  const amount = hre.ethers.parseEther("50");
  console.log(`\n🔨 Minting ${hre.ethers.formatEther(amount)} SEMILLA...`);

  const tx = await token.mint(josuWallet, amount);
  console.log(`⏳ Transaction sent: ${tx.hash}`);
  console.log("Esperando confirmación...");

  const receipt = await tx.wait();
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

  // Check new balance
  const balanceAfter = await token.balanceOf(josuWallet);
  console.log(`\n💰 Balance nuevo: ${hre.ethers.formatEther(balanceAfter)} SEMILLA`);

  // Check total supply
  const totalSupply = await token.totalSupply();
  console.log(`📊 Total Supply: ${hre.ethers.formatEther(totalSupply)} SEMILLA`);

  // Check remaining mintable
  const maxSupply = await token.MAX_TOTAL_SUPPLY();
  const remaining = maxSupply - totalSupply;
  console.log(`🔢 Remaining mintable: ${hre.ethers.formatEther(remaining)} SEMILLA`);

  console.log("\n🎉 ¡Mint exitoso!");
  console.log("\n📝 Próximos pasos:");
  console.log("1. Verificar en Polygonscan:");
  console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("\n2. Verificar backend detectó el evento");
  console.log("   (buscar log: TokensMinted on amoy)");
  console.log("\n3. Si aún no lo hiciste, transferir ownership a Gnosis Safe");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error durante mint:");
    console.error(error);
    process.exit(1);
  });
