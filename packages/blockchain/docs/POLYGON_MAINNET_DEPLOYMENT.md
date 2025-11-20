# 🚀 Polygon Mainnet Deployment Guide

**Tiempo estimado:** 30-45 minutos
**Costo:** ~0.05-0.1 MATIC (~$0.05-0.10 USD)

---

## ⚠️ ADVERTENCIA

Este deployment es para **PRODUCCIÓN**. Asegúrate de:
- ✅ Haber probado todo en Amoy testnet
- ✅ Tener Gnosis Safe configurado
- ✅ Haber hecho auditoría de seguridad del contrato
- ✅ Tener backup de todas las private keys
- ✅ Entender los riesgos de smart contracts en mainnet

---

## 📋 Paso 1: Preparación (15 minutos)

### 1.1 Crear Gnosis Safe en Polygon Mainnet

1. Ir a: https://app.safe.global/
2. Conectar wallet con MetaMask
3. Cambiar red a **Polygon (Mainnet)**
4. Click "Create new Safe"
5. Configurar owners:
   - Mínimo 3 owners recomendado
   - Threshold: 2/3 o 3/5
6. Nombrar: "SEMILLA Token Admin - Polygon"
7. Deploy Safe
8. **Guardar address del Safe**

Ejemplo: `0x1234567890abcdef1234567890abcdef12345678`

### 1.2 Obtener MATIC

Necesitas ~0.1 MATIC para deployment y gas.

**Opciones:**
- Comprar MATIC en Coinbase/Binance/Kraken
- Bridge desde Ethereum usando Polygon Bridge
- Comprar con tarjeta en Polygon

Enviar a tu deployer wallet.

### 1.3 Configurar Variables de Entorno

```bash
cd /home/josu/truk/packages/blockchain
nano .env
```

Agregar/verificar:
```bash
# Polygon Mainnet
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_deployer_private_key_here

# Gnosis Safe
GNOSIS_SAFE_POLYGON_MAINNET=0xYourSafeAddressHere

# Polygonscan (for verification)
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

**Obtener Polygonscan API Key:**
1. Ir a: https://polygonscan.com/
2. Crear cuenta
3. My Profile → API Keys → Add
4. Copiar API key

### 1.4 Verificar Balance

```bash
cd /home/josu/truk/packages/blockchain

npx hardhat run scripts/check-balance.js --network polygon
```

Debe mostrar > 0.1 MATIC

---

## 🧪 Paso 2: Dry Run (5 minutos)

Primero, ejecutar un dry run para estimar costos:

```bash
cd /home/josu/truk/packages/blockchain

DRY_RUN=true npx hardhat run scripts/deploy-polygon-mainnet.js --network polygon
```

**Output esperado:**
```
🚀 Polygon Mainnet Deployment: WrappedSEMILLA
============================================

⚠️  DRY RUN MODE - No actual deployment

Network: polygon
Deployer: 0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf
Balance: 0.5 MATIC

Gnosis Safe: 0x1234567890abcdef1234567890abcdef12345678

✅ Gnosis Safe verified

⛽ Gas Information:
   Gas Price: 120 Gwei
   Max Fee: 150 Gwei
   Priority Fee: 30 Gwei

📊 Estimated Deployment Cost: 0.08 MATIC

✅ Dry run complete. Ready to deploy.

📋 Next steps:
1. Ensure you have enough MATIC for gas
2. Run without DRY_RUN=true to deploy
3. Verify contract on Polygonscan
4. Transfer ownership to Gnosis Safe
```

Si todo se ve bien, proceder al deployment real.

---

## 🚀 Paso 3: Deployment Real (10 minutos)

### 3.1 Ejecutar Deployment

**⚠️ ÚLTIMA OPORTUNIDAD PARA REVISAR TODO**

```bash
cd /home/josu/truk/packages/blockchain

AUTO_CONFIRM=true npx hardhat run scripts/deploy-polygon-mainnet.js --network polygon
```

**Output exitoso:**
```
🚀 Polygon Mainnet Deployment: WrappedSEMILLA
============================================

🔴 LIVE DEPLOYMENT - Real MATIC will be spent

Network: polygon
Deployer: 0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf
Balance: 0.5 MATIC

Gnosis Safe: 0x1234567890abcdef1234567890abcdef12345678

✅ Gnosis Safe verified

⛽ Gas Information:
   Gas Price: 120 Gwei
   [...]

🚀 Starting deployment...

📝 Deploying WrappedSEMILLA...
   Admin: 0x1234567890abcdef1234567890abcdef12345678
   Bridge Operator: 0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf (temporary)

⏳ Waiting for deployment...

🎉 DEPLOYMENT SUCCESSFUL!
=========================

Contract: 0x9876543210fedcba9876543210fedcba98765432
Network: Polygon Mainnet
Admin: 0x1234567890abcdef1234567890abcdef12345678
Bridge Operator: 0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf

Deploy Tx Hash: 0xabc123...
Block: 52847291

📄 Deployment info saved to: ../deployments/polygon-mainnet-wsemilla.json
```

### 3.2 Guardar Contract Address

```bash
# Copiar address del contrato
CONTRACT_ADDRESS=0x9876543210fedcba9876543210fedcba98765432

# Actualizar .env
echo "POLYGON_WSEMILLA_ADDRESS=$CONTRACT_ADDRESS" >> .env
```

---

## ✅ Paso 4: Verificar en Polygonscan (5 minutos)

### 4.1 Verificar Contrato

```bash
cd /home/josu/truk/packages/blockchain

npx hardhat verify --network polygon \
  0x9876543210fedcba9876543210fedcba98765432 \
  "0x1234567890abcdef1234567890abcdef12345678" \
  "0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf"
```

**Output exitoso:**
```
Successfully submitted source code for contract
contracts/polygon/WrappedSEMILLA.sol:WrappedSEMILLA at 0x9876543210fedcba9876543210fedcba98765432
for verification on Etherscan. Waiting for verification result...

Successfully verified contract WrappedSEMILLA on Polygonscan.
https://polygonscan.com/address/0x9876543210fedcba9876543210fedcba98765432#code
```

### 4.2 Verificar en Explorer

Ir a:
```
https://polygonscan.com/address/0x9876543210fedcba9876543210fedcba98765432
```

Verificar:
- ✅ Contract está verificado (green checkmark)
- ✅ Name: Wrapped SEMILLA
- ✅ Symbol: wSEMILLA
- ✅ Decimals: 2
- ✅ Total Supply: 0

---

## 🔐 Paso 5: Configurar Bridge Operator (10 minutos)

### 5.1 Preparar Backend Wallet

El backend necesita una wallet para operar el bridge:

```bash
# Generar nueva wallet para backend
cd /home/josu/truk/packages/backend

node -e "
const ethers = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
"
```

**Guardar estos valores de forma segura!**

### 5.2 Agregar como Bridge Operator via Gnosis Safe

1. Ir a: https://app.safe.global/
2. Seleccionar tu Safe
3. New Transaction → Contract Interaction
4. Contract Address: `0x9876543210fedcba9876543210fedcba98765432`
5. Cargar ABI (desde `contracts/polygon/WrappedSEMILLA.sol`)
6. Function: `addBridgeOperator`
7. Parameters:
   - operator: `<BACKEND_WALLET_ADDRESS>`
8. Submit → Collect signatures → Execute

### 5.3 Actualizar Backend .env

```bash
cd /home/josu/truk/packages/backend
nano .env
```

Agregar:
```bash
# Polygon Bridge
POLYGON_WSEMILLA_ADDRESS=0x9876543210fedcba9876543210fedcba98765432
POLYGON_BRIDGE_OPERATOR_PRIVATE_KEY=0xBackendWalletPrivateKey
POLYGON_RPC_URL=https://polygon-rpc.com
```

### 5.4 Reiniciar Backend

```bash
cd /home/josu/truk/packages/backend
npm run dev
```

Buscar en logs:
```
[BlockchainService] Bridge initialized for polygon
[BlockchainService] Listening for TokensMinted events on polygon
```

---

## 🧪 Paso 6: Test Bridge (5 minutos)

### 6.1 Test Lock & Mint

Desde el backend o frontend:

1. Usuario bloquea 50 SEMILLA en internal chain
2. Backend detecta lock
3. Backend llama a WrappedSEMILLA.bridgeMint()
4. Usuario recibe 50 wSEMILLA en Polygon

### 6.2 Verificar en Polygonscan

```
https://polygonscan.com/token/0x9876543210fedcba9876543210fedcba98765432
```

Debe mostrar:
- Transfer event
- Balance del usuario

### 6.3 Test Burn & Unlock

1. Usuario llama a WrappedSEMILLA.bridgeBurn()
2. Backend detecta burn event
3. Backend desbloquea SEMILLA en internal chain
4. Usuario recibe SEMILLA de vuelta

---

## 📊 Monitoreo y Mantenimiento

### Monitorear Eventos

```bash
# Ver eventos de mint
npx hardhat run scripts/monitor-events.js --network polygon

# Ver supply total
npx hardhat console --network polygon
> const token = await ethers.getContractAt("WrappedSEMILLA", "0x987654...")
> await token.totalSupply()
```

### Alertas Automáticas

El backend ya tiene NotificationService configurado para:
- Mints grandes (> 1000 SEMILLA)
- Burns sospechosos
- Emergency pause events

Asegúrate de configurar:
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## 🆘 Emergency Procedures

### Pausar el Contrato

Si detectas actividad sospechosa:

1. Ir a Gnosis Safe
2. Contract Interaction → WrappedSEMILLA
3. Function: `pause()`
4. Submit → Signatures → Execute

Esto detiene todos los transfers y mints.

### Despausar

1. Gnosis Safe → WrappedSEMILLA
2. Function: `unpause()`
3. Execute

---

## ✅ Checklist de Completitud

- [ ] Gnosis Safe creado en Polygon mainnet
- [ ] MATIC obtenido para deployment
- [ ] Variables de entorno configuradas
- [ ] Dry run ejecutado exitosamente
- [ ] WrappedSEMILLA desplegado
- [ ] Contrato verificado en Polygonscan
- [ ] Backend wallet creada
- [ ] Bridge operator agregado via Safe
- [ ] Backend configurado y reiniciado
- [ ] Test bridge exitoso (lock → mint)
- [ ] Test reverse bridge (burn → unlock)
- [ ] Alertas configuradas
- [ ] Documentación actualizada
- [ ] Equipo notificado del deployment

---

## 📝 Post-Deployment

### Agregar Liquidez en DEX (Opcional)

Si quieres que usuarios puedan tradear wSEMILLA:

1. Crear pool en QuickSwap o SushiSwap
2. Agregar liquidez wSEMILLA/MATIC
3. Publicar address del pool

### Listing en CoinGecko/CMC (Futuro)

Cuando tengas volumen:
1. Aplicar a CoinGecko
2. Aplicar a CoinMarketCap
3. Proveer: contract, supply, volume, socials

---

## 🔗 Links Útiles

- **Polygonscan:** https://polygonscan.com/
- **Gnosis Safe:** https://app.safe.global/
- **QuickSwap:** https://quickswap.exchange/
- **Polygon Bridge:** https://wallet.polygon.technology/
- **Gas Tracker:** https://polygonscan.com/gastracker

---

> **"Polygon ofrece fees bajos (~$0.01 por transacción) y confirmaciones rápidas (~2 segundos). Ideal para usuarios que quieren usar SEMILLA en DeFi. 🚀"**

**¡Éxito con tu deployment en Polygon Mainnet! 🎉**
