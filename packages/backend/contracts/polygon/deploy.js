const hre = require("hardhat");

/**
 * Deploy WrappedSEMILLA contract to Polygon
 *
 * Usage:
 * - Testnet: npx hardhat run scripts/deploy.js --network mumbai
 * - Mainnet: npx hardhat run scripts/deploy.js --network polygon
 */
async function main() {
  console.log("🚀 Deploying WrappedSEMILLA to", hre.network.name);
  console.log("⏳ Please wait...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no MATIC. Please fund it first.");
  }

  // Get bridge operator address (from env or use deployer as default)
  const bridgeOperator = process.env.BRIDGE_OPERATOR_ADDRESS || deployer.address;
  console.log("🌉 Bridge operator:", bridgeOperator);
  console.log("👤 Admin:", deployer.address, "\n");

  // Deploy contract
  console.log("📦 Deploying WrappedSEMILLA contract...");
  const WrappedSEMILLA = await hre.ethers.getContractFactory("WrappedSEMILLA");
  const wSemilla = await WrappedSEMILLA.deploy(
    deployer.address,  // admin
    bridgeOperator     // bridge operator
  );

  await wSemilla.waitForDeployment();
  const contractAddress = await wSemilla.getAddress();

  console.log("✅ WrappedSEMILLA deployed to:", contractAddress);
  console.log("\n📋 Contract Details:");
  console.log("   Name:", await wSemilla.name());
  console.log("   Symbol:", await wSemilla.symbol());
  console.log("   Decimals:", await wSemilla.decimals());
  console.log("   Total Supply:", await wSemilla.totalSupply());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    bridgeOperator: bridgeOperator,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for block confirmations
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for 5 block confirmations...");
    await wSemilla.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!");

    // Verify on Polygonscan
    if (process.env.POLYGONSCAN_API_KEY) {
      console.log("\n🔍 Verifying contract on Polygonscan...");
      try {
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [deployer.address, bridgeOperator],
        });
        console.log("✅ Contract verified!");
      } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
  }

  // Instructions
  console.log("\n📝 Next Steps:");
  console.log("1. Add this contract address to your .env file:");
  console.log(`   POLYGON_SEMILLA_CONTRACT=${contractAddress}`);
  console.log("\n2. Update backend configuration to use this contract");
  console.log("\n3. Grant BRIDGE_ROLE to your backend service address:");
  console.log(`   wSemilla.addBridgeOperator("YOUR_BACKEND_ADDRESS")`);
  console.log("\n4. Test minting:");
  console.log(`   wSemilla.bridgeMint("USER_ADDRESS", 10000, "did:gailu:...", "0x...")`);

  console.log("\n🎉 Deployment Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
