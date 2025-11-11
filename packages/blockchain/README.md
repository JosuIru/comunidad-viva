# 🔗 SEMILLA Token - Blockchain Package

Moneda comunitaria ERC20 para Comunidad Viva, desplegada en Polygon Amoy (testnet).

**Status:** ✅ Ready for Beta Testing
**Contract:** `0x8a3b2D350890e23D5679a899070B462DfFEe0643`
**Explorer:** https://amoy.polygonscan.com/address/0x8a3b2D350890e23D5679a899070B462DfFEe0643

## 📋 Resumen Ejecutivo

```
✅ Smart contract deployed y verificado (100% OpenZeppelin)
✅ 115 SEMILLA minted y funcionando
✅ Backend integration completa
✅ Emergency procedures validadas
✅ MetaMask integration funcionando
✅ Documentación completa para beta testers
```

**Logros:** Sistema blockchain completo desarrollado en ~2 días con $0 de inversión.

**Listo para:** Reclutar 10-15 beta testers y comenzar Phase 1.

---

## 🚀 Quick Start

```bash
# Instalación
cd packages/blockchain
npm install

# Configuración
cp .env.example .env
# Edita .env con tu PRIVATE_KEY
chmod 600 .env

# Deploy (si es necesario)
npx hardhat run scripts/deploy.js --network amoy

# Verificar balances
npx hardhat run scripts/check-all-balances.js --network amoy
```

---

## 📦 Información del Contrato

```
Network: Polygon Amoy Testnet
Chain ID: 80002  
Contract: 0x8a3b2D350890e23D5679a899070B462DfFEe0643
Token: SEMILLA (18 decimals)
Total Supply: 115 SEMILLA
Max Supply: 10,000 SEMILLA
```

**Características:**
- ✅ ERC20 Standard (100% OpenZeppelin)
- ✅ Mintable (role: MINTER_ROLE)
- ✅ Burnable
- ✅ Pausable (Emergency circuit breaker)
- ✅ Transfer limit: 100 SEMILLA/tx
- ✅ Hard cap: 10,000 SEMILLA max

---

## 📜 Scripts Disponibles

```bash
# Monitoring
npx hardhat run scripts/check-all-balances.js --network amoy

# Minting (edita dirección en el script)
npx hardhat run scripts/mint-to-josu-real-wallet.js --network amoy

# Emergency
npx hardhat run scripts/emergency-pause.js --network amoy
npx hardhat run scripts/emergency-unpause.js --network amoy

# Testing
npx hardhat run scripts/test-transfer-from-deployer.js --network amoy
```

---

## 📚 Documentación

### Para Beta Testers (START HERE)
- **[GUIA_USUARIO_BETA.md](./GUIA_USUARIO_BETA.md)** - Guía paso a paso para usuarios no técnicos

### Para Desarrolladores
- **[docs/EMERGENCY_DRILL_SUCCESS.md](./docs/EMERGENCY_DRILL_SUCCESS.md)** - Procedimientos de emergencia validados
- **[docs/SECURITY_STRATEGY_AMOY.md](./docs/SECURITY_STRATEGY_AMOY.md)** - Estrategia de seguridad
- **[docs/MINT_LOG.md](./docs/MINT_LOG.md)** - Registro de transacciones

### Para Planificación
- **[docs/BETA_TESTING_PLAN.md](./docs/BETA_TESTING_PLAN.md)** - Plan de beta testing
- **[docs/GNOSIS_SAFE_SETUP.md](./docs/GNOSIS_SAFE_SETUP.md)** - Setup multi-sig (futuro mainnet)

---

## 🔐 Security

**Private keys:** NUNCA commitear al repo
```bash
chmod 600 .env
ls -la .env  # Debe mostrar: -rw-------
```

**Emergency pause:**
```bash
PAUSE_REASON="Security incident" npx hardhat run scripts/emergency-pause.js --network amoy
```

Ver **[docs/EMERGENCY_DRILL_SUCCESS.md](./docs/EMERGENCY_DRILL_SUCCESS.md)** para procedimientos completos.

---

## 🌐 Backend Integration

El backend detecta automáticamente eventos del smart contract.

**Configuración requerida en `/packages/backend/.env`:**
```
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
SEMILLA_TOKEN_AMOY=0x8a3b2D350890e23D5679a899070B462DfFEe0643
```

**Verificar:**
```bash
# Los logs del backend deben mostrar:
✅ Connected to amoy
✅ amoy contract initialized: Semilla Token (SEMILLA)
✅ Event listeners active for amoy
```

---

## 🧪 Testing

```bash
# Unit tests
npx hardhat test

# Coverage
npx hardhat coverage

# Local network
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2
```

---

## 📈 Roadmap

### ✅ Completado
- [x] Smart contract ERC20
- [x] Deploy a Polygon Amoy
- [x] Emergency procedures
- [x] Backend integration
- [x] Documentation completa

### 🔄 En Progreso
- [ ] Beta testing (10-15 usuarios)

### 📅 Próximos Pasos
- [ ] Deploy a Polygon Mainnet
- [ ] Gnosis Safe multi-sig
- [ ] Deploy a BSC
- [ ] Automated monitoring

---

## 🔗 Links Útiles

- **Faucet (POL):** https://faucet.polygon.technology/
- **Explorer:** https://amoy.polygonscan.com
- **Hardhat:** https://hardhat.org/
- **OpenZeppelin:** https://docs.openzeppelin.com/

---

**Última actualización:** 2025-11-03  
**Versión:** 1.0.0-beta  
**Status:** ✅ Ready for Beta Testing
