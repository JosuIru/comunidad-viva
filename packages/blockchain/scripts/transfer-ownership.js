const hre = require("hardhat");

async function main() {
  // ⚠️ IMPORTANTE: Reemplazar con tu Gnosis Safe address
  // Obtendrás esta address después de crear el Safe en https://app.safe.global/
  const safeAddress = process.env.GNOSIS_SAFE_ADDRESS || "0x0000000000000000000000000000000000000000";

  if (safeAddress === "0x0000000000000000000000000000000000000000") {
    console.error("❌ ERROR: GNOSIS_SAFE_ADDRESS no configurada");
    console.error("\nPor favor:");
    console.error("1. Crea un Gnosis Safe en https://app.safe.global/");
    console.error("2. Copia la address del Safe");
    console.error("3. Ejecuta:");
    console.error("   GNOSIS_SAFE_ADDRESS=0xYourSafeAddress npx hardhat run scripts/transfer-ownership.js --network amoy");
    process.exit(1);
  }

  // Connect to deployed contract
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";
  console.log("\n🔗 Connecting to SemillaToken...");
  console.log(`Contract: ${contractAddress}`);
  console.log(`Network: ${hre.network.name}`);

  const SemillaToken = await hre.ethers.getContractFactory("SemillaToken");
  const token = await SemillaToken.attach(contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  console.log("\n🔐 Transferring ownership to Gnosis Safe...");
  console.log(`Safe Address: ${safeAddress}`);

  // Get role hashes
  const MINTER_ROLE = await token.MINTER_ROLE();
  const PAUSER_ROLE = await token.PAUSER_ROLE();
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

  console.log("\n📋 Role Hashes:");
  console.log(`MINTER_ROLE: ${MINTER_ROLE}`);
  console.log(`PAUSER_ROLE: ${PAUSER_ROLE}`);
  console.log(`DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}`);

  // Check current roles
  console.log("\n🔍 Current roles:");
  const deployerHasMinter = await token.hasRole(MINTER_ROLE, deployer.address);
  const deployerHasPauser = await token.hasRole(PAUSER_ROLE, deployer.address);
  const deployerHasAdmin = await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

  console.log(`Deployer has MINTER_ROLE: ${deployerHasMinter}`);
  console.log(`Deployer has PAUSER_ROLE: ${deployerHasPauser}`);
  console.log(`Deployer has DEFAULT_ADMIN_ROLE: ${deployerHasAdmin}`);

  // Grant all roles to Safe
  console.log("\n📝 Granting roles to Gnosis Safe...");

  let tx = await token.grantRole(MINTER_ROLE, safeAddress);
  console.log(`⏳ Granting MINTER_ROLE... tx: ${tx.hash}`);
  await tx.wait();
  console.log("✅ MINTER_ROLE granted to Safe");

  tx = await token.grantRole(PAUSER_ROLE, safeAddress);
  console.log(`⏳ Granting PAUSER_ROLE... tx: ${tx.hash}`);
  await tx.wait();
  console.log("✅ PAUSER_ROLE granted to Safe");

  tx = await token.grantRole(DEFAULT_ADMIN_ROLE, safeAddress);
  console.log(`⏳ Granting DEFAULT_ADMIN_ROLE... tx: ${tx.hash}`);
  await tx.wait();
  console.log("✅ DEFAULT_ADMIN_ROLE granted to Safe");

  console.log("\n🗑️  Revoking roles from deployer...");

  // Revoke MINTER_ROLE
  tx = await token.revokeRole(MINTER_ROLE, deployer.address);
  console.log(`⏳ Revoking MINTER_ROLE... tx: ${tx.hash}`);
  await tx.wait();
  console.log("✅ MINTER_ROLE revoked from deployer");

  // Revoke PAUSER_ROLE
  tx = await token.revokeRole(PAUSER_ROLE, deployer.address);
  console.log(`⏳ Revoking PAUSER_ROLE... tx: ${tx.hash}`);
  await tx.wait();
  console.log("✅ PAUSER_ROLE revoked from deployer");

  // Renounce admin last (can't revoke yourself, must renounce)
  tx = await token.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log(`⏳ Renouncing DEFAULT_ADMIN_ROLE... tx: ${tx.hash}`);
  await tx.wait();
  console.log("✅ DEFAULT_ADMIN_ROLE renounced by deployer");

  // Verify final state
  console.log("\n🔍 Final verification:");
  const safeHasMinter = await token.hasRole(MINTER_ROLE, safeAddress);
  const safeHasPauser = await token.hasRole(PAUSER_ROLE, safeAddress);
  const safeHasAdmin = await token.hasRole(DEFAULT_ADMIN_ROLE, safeAddress);

  console.log(`Safe has MINTER_ROLE: ${safeHasMinter} ${safeHasMinter ? "✅" : "❌"}`);
  console.log(`Safe has PAUSER_ROLE: ${safeHasPauser} ${safeHasPauser ? "✅" : "❌"}`);
  console.log(`Safe has DEFAULT_ADMIN_ROLE: ${safeHasAdmin} ${safeHasAdmin ? "✅" : "❌"}`);

  const deployerStillHasMinter = await token.hasRole(MINTER_ROLE, deployer.address);
  const deployerStillHasPauser = await token.hasRole(PAUSER_ROLE, deployer.address);
  const deployerStillHasAdmin = await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

  console.log(`Deployer still has MINTER_ROLE: ${deployerStillHasMinter} ${!deployerStillHasMinter ? "✅" : "❌"}`);
  console.log(`Deployer still has PAUSER_ROLE: ${deployerStillHasPauser} ${!deployerStillHasPauser ? "✅" : "❌"}`);
  console.log(`Deployer still has DEFAULT_ADMIN_ROLE: ${deployerStillHasAdmin} ${!deployerStillHasAdmin ? "✅" : "❌"}`);

  if (safeHasMinter && safeHasPauser && safeHasAdmin &&
      !deployerStillHasMinter && !deployerStillHasPauser && !deployerStillHasAdmin) {
    console.log("\n🎉 ¡OWNERSHIP TRANSFERRED SUCCESSFULLY!");
    console.log("\n⚠️  IMPORTANTE:");
    console.log("   ✅ Deployer wallet NO tiene ningún control");
    console.log("   ✅ SOLO Gnosis Safe puede mint/pause/admin");
    console.log("   ✅ Se requieren múltiples firmas para cualquier acción");
    console.log("\n📝 Próximo paso:");
    console.log("   - Probar mint desde Gnosis Safe UI");
    console.log("   - Verificar que backend detecta el evento");
  } else {
    console.log("\n❌ ERROR: Transfer no completado correctamente");
    console.log("   Por favor revisa los logs arriba");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error durante transfer:");
    console.error(error);
    process.exit(1);
  });
