const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";

  const wallets = [
    { name: "Test Wallet", address: "0x25Dd6346FE82E51001a9430CF07e8DeB84933627" },
    { name: "Josu Wallet", address: "0xe88952fa33112ec58c83dae2974c0fef679b553d" },
  ];

  console.log("\n📊 Balance Summary");
  console.log("==================");
  console.log("Contract:", contractAddress);
  console.log("Network:", hre.network.name);

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Get token info
  const totalSupply = await token.totalSupply();
  const maxSupply = await token.MAX_TOTAL_SUPPLY();
  const remaining = maxSupply - totalSupply;

  console.log("\n💰 Token Info:");
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), "SEMILLA");
  console.log("Max Supply:", hre.ethers.formatEther(maxSupply), "SEMILLA");
  console.log("Remaining:", hre.ethers.formatEther(remaining), "SEMILLA");
  console.log("Utilization:", ((Number(totalSupply) / Number(maxSupply)) * 100).toFixed(2) + "%");

  console.log("\n👥 Wallet Balances:");
  let totalAccountedFor = 0n;

  for (const wallet of wallets) {
    const balance = await token.balanceOf(wallet.address);
    console.log("\n" + wallet.name + ":");
    console.log("  Address:", wallet.address);
    console.log("  Balance:", hre.ethers.formatEther(balance), "SEMILLA");
    totalAccountedFor += balance;
  }

  console.log("\n✅ Verification:");
  console.log("Total in tracked wallets:", hre.ethers.formatEther(totalAccountedFor), "SEMILLA");
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), "SEMILLA");

  if (totalAccountedFor === totalSupply) {
    console.log("✅ All tokens accounted for!");
  } else {
    const difference = totalSupply - totalAccountedFor;
    console.log("⚠️  Unaccounted:", hre.ethers.formatEther(difference), "SEMILLA");
    console.log("(This is normal if there are other holders)");
  }

  // Check if paused
  const isPaused = await token.paused();
  console.log("\n🔒 Contract Status:");
  console.log("Paused:", isPaused ? "YES ⚠️" : "NO ✅");

  console.log("\n🔗 Links:");
  console.log("Contract:", "https://amoy.polygonscan.com/address/" + contractAddress);
  for (const wallet of wallets) {
    console.log(wallet.name + ":", "https://amoy.polygonscan.com/address/" + wallet.address);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
