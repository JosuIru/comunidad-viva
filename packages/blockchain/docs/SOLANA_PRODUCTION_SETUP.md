# 🌐 Solana Production Setup Guide

**Tiempo estimado:** 20-30 minutos
**Costo:** ~0.01 SOL (devnet: gratis)

---

## 📋 Prerequisitos

### 1. Instalar Solana CLI

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH
export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version
```

### 2. Configurar Red

**Para Devnet (testing):**
```bash
solana config set --url https://api.devnet.solana.com
```

**Para Mainnet (producción):**
```bash
solana config set --url https://api.mainnet-beta.solana.com
```

---

## 🚀 Paso 1: Ejecutar Script de Setup

### 1.1 Navegar al directorio

```bash
cd /home/josu/truk/packages/blockchain
```

### 1.2 Instalar dependencias de Solana

```bash
npm install @solana/web3.js@1.95.8 @solana/spl-token@0.4.14
```

### 1.3 Ejecutar setup en Devnet (recomendado primero)

```bash
node scripts/setup-solana-production.js --network devnet
```

**Output esperado:**
```
🚀 Solana SPL Token Setup
========================

Network: devnet
Token: Wrapped SEMILLA (wSEMILLA)
Decimals: 18

📡 Connected to Solana devnet

🔑 Generating new authority keypair...
✅ Keypair saved to: ../keys/solana-authority-devnet.json
⚠️  IMPORTANT: Backup this file securely!
Authority: 5tKZM...abc123

💰 SOL Balance: 0.0000 SOL

❌ Insufficient SOL balance

💡 Get devnet SOL from:
   solana airdrop 2 5tKZM...abc123 --url devnet
   or: https://faucet.solana.com/
```

### 1.4 Obtener SOL de Devnet

```bash
# Airdrop SOL (devnet only)
solana airdrop 2 YOUR_AUTHORITY_ADDRESS --url devnet

# Or visit: https://faucet.solana.com/
```

### 1.5 Ejecutar setup nuevamente

```bash
node scripts/setup-solana-production.js --network devnet
```

**Output exitoso:**
```
🚀 Solana SPL Token Setup
========================

Network: devnet
Token: Wrapped SEMILLA (wSEMILLA)
Decimals: 18

📡 Connected to Solana devnet
🔑 Loading authority keypair from: ../keys/solana-authority-devnet.json
Authority: 5tKZM...abc123

💰 SOL Balance: 2.0000 SOL

🏭 Creating new SPL Token mint...

🎉 SUCCESS! SPL Token created:
==============================
Mint Address: 7xKXtg2...xyz789
Authority: 5tKZM...abc123
Network: devnet
Decimals: 18

📝 Environment Variables:
Add these to your .env file:

SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_SEMILLA_MINT=7xKXtg2...xyz789
SOLANA_AUTHORITY_PRIVATE_KEY='[123,456,789...]'

🧪 Testing mint functionality...
Token Account: 3Qx9F...def456

✅ Test mint successful!
   Signature: 2nBG8...sig123
   Amount: 100 wSEMILLA

🔍 View on Solana Explorer:
   https://explorer.solana.com/address/7xKXtg2...xyz789?cluster=devnet

✅ Setup complete!

📋 Next steps:
1. Backup your keypair file securely
2. Add environment variables to .env
3. Test minting from backend service
4. For mainnet: Consider using a multisig for mint authority
```

---

## 📝 Paso 2: Configurar Variables de Entorno

### 2.1 Actualizar `.env` del backend

```bash
cd /home/josu/truk/packages/backend
nano .env
```

Agregar:
```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_SEMILLA_MINT=7xKXtg2CCtYJizRaaYrP8btqJST5vQKBPmLLW9GHb6v
SOLANA_AUTHORITY_PRIVATE_KEY='[123,456,789,...]'
```

**IMPORTANTE:**
- Copiar exactamente el array de la salida del script
- NO compartir la private key
- NO commitear al repositorio

### 2.2 Agregar al `.env.example`

```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_SEMILLA_MINT=your_mint_address_here
SOLANA_AUTHORITY_PRIVATE_KEY=your_private_key_array_here
```

---

## 🧪 Paso 3: Probar desde Backend

### 3.1 Reiniciar Backend

```bash
cd /home/josu/truk/packages/backend
npm run dev
```

### 3.2 Verificar inicialización

Buscar en los logs:
```
[SolanaContractService] Solana bridge service initialized successfully
```

### 3.3 Test Mint

Crear archivo de test:
```bash
cd /home/josu/truk/packages/backend
node -e "
const { SolanaContractService } = require('./dist/federation/solana-contract.service');

const service = new SolanaContractService();

// Wait for initialization
setTimeout(async () => {
  try {
    const result = await service.mintTokens(
      '5tKZMEKKWyD7qLoQajskMfqpBWF3vXtRp8DpWmvt2yB3',
      50,
      'did:gailu:comunidad-viva:user123',
      'test-tx-001'
    );

    console.log('✅ Mint successful!');
    console.log('Signature:', result.signature);
    console.log('Slot:', result.slot);
  } catch (error) {
    console.error('❌ Mint failed:', error);
  }
}, 2000);
"
```

### 3.4 Verificar en Explorer

Ir a:
```
https://explorer.solana.com/tx/YOUR_SIGNATURE?cluster=devnet
```

---

## 🔐 Paso 4: Backup y Seguridad

### 4.1 Backup del Keypair

```bash
# Copiar keypair a un lugar seguro
cp /home/josu/truk/packages/blockchain/keys/solana-authority-devnet.json \
   ~/Backups/solana-authority-devnet-$(date +%Y%m%d).json

# Cifrar el backup
gpg -c ~/Backups/solana-authority-devnet-*.json
```

### 4.2 Agregar al .gitignore

```bash
cd /home/josu/truk
echo "packages/blockchain/keys/" >> .gitignore
```

### 4.3 Verificar que NO esté en git

```bash
git status | grep "keys/"
# Should return nothing
```

---

## 🚀 Paso 5: Deploy a Mainnet (Producción)

**⚠️ SOLO cuando estés listo para producción**

### 5.1 Obtener SOL en Mainnet

Necesitas ~0.1 SOL para:
- Crear el mint
- Crear token accounts
- Transacciones de mint

Comprar en:
- Coinbase
- Binance
- Kraken

### 5.2 Ejecutar Setup en Mainnet

```bash
cd /home/josu/truk/packages/blockchain
node scripts/setup-solana-production.js --network mainnet-beta
```

### 5.3 Actualizar .env con Mainnet

```bash
# Production Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_SEMILLA_MINT=<mainnet_mint_address>
SOLANA_AUTHORITY_PRIVATE_KEY='[mainnet_keypair_array]'
```

---

## 🔒 Seguridad Avanzada (Opcional)

### Opción 1: Multisig con Squads Protocol

Squads permite multisig en Solana:

1. Ir a: https://squads.so/
2. Crear un Squad (multisig wallet)
3. Agregar miembros del equipo
4. Transferir mint authority al Squad

```bash
# Transfer mint authority to Squad
spl-token authorize <MINT_ADDRESS> mint <SQUAD_ADDRESS> --url mainnet-beta
```

### Opción 2: Hardware Wallet

Usar Ledger con Solana:

```bash
# Generate keypair using Ledger
solana-keygen pubkey usb://ledger

# Use with spl-token
spl-token create-token --mint-authority usb://ledger
```

---

## 📊 Monitoreo

### Check Token Supply

```bash
spl-token supply <MINT_ADDRESS> --url devnet
```

### Check Account Balance

```bash
spl-token balance <MINT_ADDRESS> --owner <WALLET_ADDRESS> --url devnet
```

### List All Accounts

```bash
spl-token accounts --url devnet
```

---

## 🆘 Troubleshooting

### Error: "Insufficient funds"

**Causa:** No hay SOL para gas
**Solución:**
```bash
# Devnet
solana airdrop 2 <ADDRESS> --url devnet

# Mainnet
# Comprar SOL y enviar a la address
```

### Error: "Invalid keypair"

**Causa:** Formato incorrecto de SOLANA_AUTHORITY_PRIVATE_KEY
**Solución:**
- Debe ser un array JSON: `[123, 456, 789, ...]`
- NO debe tener saltos de línea dentro del string
- Usar comillas simples en .env

### Error: "Mint already exists"

**Causa:** Ya hay un mint configurado
**Solución:**
- Verificar `SOLANA_SEMILLA_MINT` en .env
- Ejecutar script nuevamente (detectará el mint existente)

### Backend no puede mintear

**Causa:** Private key no cargada correctamente
**Solución:**
1. Verificar formato del array en .env
2. Reiniciar backend
3. Buscar en logs: "Solana bridge service initialized"

---

## ✅ Checklist de Completitud

- [ ] Solana CLI instalado y configurado
- [ ] Keypair generado y guardado de forma segura
- [ ] SOL obtenido (devnet o mainnet)
- [ ] SPL Token mint creado
- [ ] Variables de entorno configuradas
- [ ] Backend detecta configuración de Solana
- [ ] Test mint exitoso desde backend
- [ ] Keypair respaldado y cifrado
- [ ] Keys/ en .gitignore
- [ ] (Mainnet) Multisig configurado
- [ ] Documentación actualizada

---

## 🔗 Links Útiles

- **Solana Explorer (Devnet):** https://explorer.solana.com/?cluster=devnet
- **Solana Explorer (Mainnet):** https://explorer.solana.com/
- **Solana Faucet:** https://faucet.solana.com/
- **SPL Token Docs:** https://spl.solana.com/token
- **Squads Protocol:** https://squads.so/
- **Solana Cookbook:** https://solanacookbook.com/

---

> **"Solana ofrece fees extremadamente bajos (~$0.00025 por transacción) y confirmaciones rápidas (~400ms). Perfecto para micro-transacciones de SEMILLA. ⚡"**

**¡Éxito con tu deployment de Solana! 🚀**
