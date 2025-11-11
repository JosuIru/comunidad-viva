# 🌱 SemillaToken - Smart Contract

Smart contract ERC20 para el bridge de Comunidad Viva usando **estrategia bootstrap** (sin presupuesto).

## 🔒 Filosofía de Seguridad

- **Zero código custom**: Solo usa OpenZeppelin (auditado profesionalmente)
- **Límites ultra conservadores**: Max 100 SEMILLA/mint, 10k SEMILLA total
- **Multi-sig desde día 1**: Gnosis Safe (NO claves en servidor)
- **Circuit breaker**: Pausable en emergencias
- **Tests exhaustivos**: 39 tests con 100% de escenarios críticos

## 📊 Características del Token

```solidity
Nombre: Semilla Token
Símbolo: SEMILLA
Decimales: 18
Max mint amount: 100 SEMILLA (por transacción)
Max total supply: 10,000 SEMILLA (límite bootstrap)
```

## 🏗️ Setup

```bash
# Instalar dependencias
npm install

# Copiar .env.example a .env
cp .env.example .env

# Editar .env con tus valores
# ⚠️  IMPORTANTE: Crear wallet NUEVO solo para deployment
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test coverage
npm run test:coverage

# Compile contract
npm run compile
```

**Resultado esperado:** 39 tests passing ✅

## 🚀 Deployment

### Paso 1: Polygon Amoy Testnet (SIEMPRE PRIMERO)

⚠️ **Mumbai deprecado desde abril 2024** - usar Amoy

✅ **YA DEPLOYED:**
```
Contract: SemillaToken
Address: 0x8a3b2D350890e23D5679a899070B462DfFEe0643
Network: Polygon Amoy Testnet
Explorer: https://amoy.polygonscan.com/address/0x8a3b2D350890e23D5679a899070B462DfFEe0643
```

**Para re-deploy (si necesario):**
```bash
# 1. Get testnet POL (MATIC) from faucet
# https://faucet.polygon.technology/ (Polygon Amoy)

# 2. Deploy to Amoy
npm run deploy:amoy

# 3. Verify contract (auto)
# (script already includes verification)
```

### Paso 2: Crear Gnosis Safe

⚠️ **IMPORTANTE:** Ver guía completa en `GNOSIS_SAFE_SETUP.md`

```bash
# 1. Go to https://app.safe.global/
# 2. Connect wallet
# 3. Create new Safe on Polygon Amoy
# 4. Add signers (recommend 2 of 3 or 3 of 5)
# 5. Copy Safe address
```

### Paso 3: Transfer Ownership a Multi-sig

✅ **Script listo:** `scripts/transfer-ownership.js`

```bash
# Ejecutar (reemplazar con tu Safe address):
GNOSIS_SAFE_ADDRESS=0xYourSafeAddress npx hardhat run scripts/transfer-ownership.js --network amoy
```

El script hará automáticamente:
- Grant MINTER_ROLE al Safe
- Grant PAUSER_ROLE al Safe
- Grant DEFAULT_ADMIN_ROLE al Safe
- Revoke todos los roles del deployer
- Verificar que el transfer fue exitoso

### Paso 4: Test en Amoy 4 Semanas

```bash
# Invitar beta testers
# Probar todos los flujos:
# - Mint (vía Gnosis Safe)
# - Burn
# - Transfer
# - Pause/unpause
# - Multi-sig approvals

# Objetivo: 0 bugs críticos
```

### Paso 5: Mainnet (Solo si Amoy OK)

```bash
# ⚠️  CHECKLIST ANTES DE MAINNET:
# [ ] 4+ semanas en Amoy sin issues
# [ ] 10+ beta testers probaron exitosamente
# [ ] Gnosis Safe configurado y probado
# [ ] Contract verified en Amoy
# [ ] Community review positivo
# [ ] 0 vulnerabilidades encontradas

npm run deploy:polygon
```

## 🔐 Security Features

### 1. Role-Based Access Control
```solidity
MINTER_ROLE: Puede mintear tokens (solo bridge)
PAUSER_ROLE: Puede pausar en emergencias
DEFAULT_ADMIN_ROLE: Puede grant/revoke roles
```

### 2. Pausable (Circuit Breaker)
```solidity
// Pausar en emergencia
await token.pause("Reason: Attack detected");

// Todo se bloquea: mint, burn, transfer

// Despausar después de resolver
await token.unpause();
```

### 3. Límites Conservadores
```solidity
MAX_MINT_AMOUNT = 100 SEMILLA
MAX_TOTAL_SUPPLY = 10,000 SEMILLA

// Protege contra:
// - Mint masivo accidental
// - Supply inflation attacks
// - Loss limitado a $1k-5k max
```

### 4. Burnable (para reverse bridge)
```solidity
// User quiere bridge de Polygon -> Gailu
await token.burn(amount);

// O con allowance
await token.burnFrom(userAddress, amount);
```

## 📄 Contract Files

```
contracts/
  └── SemillaToken.sol (130 líneas)
      ├── ERC20 (OpenZeppelin)
      ├── ERC20Burnable (OpenZeppelin)
      ├── Pausable (OpenZeppelin)
      └── AccessControl (OpenZeppelin)

test/
  └── SemillaToken.test.js (39 tests)
      ├── Deployment (7 tests)
      ├── Minting (8 tests)
      ├── Burning (4 tests)
      ├── Pausable (6 tests)
      ├── Access Control (3 tests)
      ├── Helper Functions (4 tests)
      ├── ERC20 Standard (3 tests)
      └── Security Edge Cases (3 tests)

scripts/
  └── deploy.js
      ├── Deploy contract
      ├── Verify on Polygonscan
      └── Save deployment info
```

## 🔍 Verification

```bash
# Manual verification (if auto fails)
npx hardhat verify --network amoy <CONTRACT_ADDRESS>

# Check on block explorer
# Amoy: https://amoy.polygonscan.com/
# Polygon: https://polygonscan.com/
```

## 🐛 Debugging

```solidity
// Common issues:

1. "Insufficient funds"
   → Need MATIC for gas. Get from faucet.

2. "Nonce too high"
   → Reset account in MetaMask

3. "Already verified"
   → Contract already verified, ignore

4. "Exceeds max mint amount"
   → Working as intended! Max 100 SEMILLA per mint

5. "Paused"
   → Contract is paused. Call unpause() via Gnosis Safe
```

## 📈 Escalamiento Futuro

```yaml
Fase 1 (Mes 1-3):
  - Max 100 SEMILLA/tx
  - Max 10k total supply
  - Manual minting vía Gnosis Safe

Fase 2 (Mes 4-6):
  - Si 0 hacks: Incrementar a 500 SEMILLA/tx
  - Max 50k total supply
  - Considerar automatización ($500-2k)

Fase 3 (Mes 7-12):
  - Si todo bien: Auditoría profesional ($50k)
  - Remove limits
  - Full automation
  - Bug bounty program
```

## 🆘 Circuit Breaker Protocol

```javascript
// Si detectas ataque o bug crítico:

// 1. PAUSE IMMEDIATELY
await token.pause("Critical: Attack detected");

// 2. Investigate
// - Check all transactions
// - Identify vulnerability
// - Plan fix

// 3. Deploy fix (si es contract)
// O
// Update backend security (si es backend)

// 4. Unpause when safe
await token.unpause();

// 5. Post-mortem
// - Document what happened
// - How was it fixed
// - How to prevent in future
```

## 🔗 Links Útiles

- **OpenZeppelin Docs**: https://docs.openzeppelin.com/contracts/
- **Hardhat Docs**: https://hardhat.org/
- **Gnosis Safe**: https://app.safe.global/
- **Mumbai Faucet**: https://faucet.polygon.technology/
- **Polygonscan**: https://polygonscan.com/
- **Solidity Security Best Practices**: https://consensys.github.io/smart-contract-best-practices/

## ⚠️  IMPORTANT WARNINGS

1. **NEVER commit .env to git**
   - Contains private keys
   - Use .env.example instead

2. **NEVER use your main wallet for deployment**
   - Create NEW wallet only for this
   - Transfer ownership to Gnosis Safe immediately

3. **NEVER skip Amoy testing**
   - Minimum 4 weeks in testnet
   - 10+ beta testers
   - All flows tested

4. **NEVER deploy to mainnet without community review**
   - Post code on Reddit/Discord
   - Ask for security review
   - Wait for feedback

5. **NEVER increase limits without testing**
   - Test new limits on Amoy first
   - Monitor for 2+ weeks
   - Only then deploy to mainnet

## 📞 Support

- **Issues**: GitHub Issues
- **Security**: security@comunidadviva.com (privado)
- **Community**: Discord/Telegram

---

**Built with ❤️ using only battle-tested OpenZeppelin code**

**No presupuesto ≠ No seguridad**
