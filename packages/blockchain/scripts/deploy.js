const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SemillaToken...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy SemillaToken
  const SemillaToken = await hre.ethers.getContractFactory("SemillaToken");
  const token = await SemillaToken.deploy();

  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  console.log("✅ SemillaToken deployed to:", tokenAddress);
  console.log("\n📊 Contract Details:");
  console.log("  Name:", await token.name());
  console.log("  Symbol:", await token.symbol());
  console.log("  Decimals:", await token.decimals());
  console.log("  Max Mint Amount:", hre.ethers.formatEther(await token.MAX_MINT_AMOUNT()), "SEMILLA");
  console.log("  Max Total Supply:", hre.ethers.formatEther(await token.MAX_TOTAL_SUPPLY()), "SEMILLA");

  console.log("\n🔑 Roles:");
  console.log("  Admin:", deployer.address);
  console.log("  Minter:", deployer.address);
  console.log("  Pauser:", deployer.address);

  console.log("\n⚠️  IMPORTANT - NEXT STEPS:");
  console.log("  1. Transfer ownership to Gnosis Safe multi-sig");
  console.log("  2. Revoke deployer's MINTER_ROLE and PAUSER_ROLE");
  console.log("  3. Keep ONLY the multi-sig as admin\n");

  console.log("📝 Gnosis Safe Setup Commands:");
  console.log(`  - Go to: https://app.safe.global/`);
  console.log(`  - Create new Safe on ${hre.network.name}`);
  console.log(`  - Add signers (recommend 2 of 3 or 3 of 5)`);
  console.log(`  - Then run transfer-ownership script with Safe address\n`);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verify contract on block explorer:");
    console.log(`  npx hardhat verify --network ${hre.network.name} ${tokenAddress}\n`);

    console.log("⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("   You can verify manually later with the command above");
    }
  }

  console.log("\n🎉 Deployment Complete!");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: tokenAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    name: await token.name(),
    symbol: await token.symbol(),
    maxMintAmount: hre.ethers.formatEther(await token.MAX_MINT_AMOUNT()),
    maxTotalSupply: hre.ethers.formatEther(await token.MAX_TOTAL_SUPPLY()),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment info saved to deployments/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
