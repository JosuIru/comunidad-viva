# 📚 Documentación Técnica - SEMILLA Token

Este directorio contiene documentación técnica, logs y planes para desarrolladores y administradores del sistema.

---

## 📑 Índice de Documentación

### 🚨 Emergency & Security
- **[EMERGENCY_DRILL_SUCCESS.md](./EMERGENCY_DRILL_SUCCESS.md)**
  - Validación de procedimientos de emergencia
  - Circuit breaker testing completo
  - Timeline de respuesta
  - Runbooks para emergencias reales
  - **Leer ANTES de ir a producción**

- **[SECURITY_STRATEGY_AMOY.md](./SECURITY_STRATEGY_AMOY.md)**
  - Estrategia de seguridad para testnet
  - Bootstrap approach (security con $0)
  - Role-based access control
  - Límites y caps

### 📊 Planning & Logs
- **[BETA_TESTING_PLAN.md](./BETA_TESTING_PLAN.md)**
  - Plan completo de beta testing (versión resumida)
  - Perfiles de testers
  - Fases del testing
  - Ver archivo completo en archives/ para detalles

- **[MINT_LOG.md](./MINT_LOG.md)**
  - Registro de todas las transacciones de minting
  - Balances actuales
  - Historia de transfers

### 🔮 Future / Mainnet
- **[GNOSIS_SAFE_SETUP.md](./GNOSIS_SAFE_SETUP.md)**
  - Setup de multi-sig wallet para mainnet
  - Gnosis Safe configuration
  - **NO necesario para testnet/beta**
  - Obligatorio antes de mainnet launch

---

## 🗂️ Organización de Archivos

```
/packages/blockchain/
├── README.md                           # Entrada principal
├── GUIA_USUARIO_BETA.md                # Guía para beta testers (NO técnica)
├── docs/                               # ← Estás aquí
│   ├── README.md                       # Este archivo
│   ├── EMERGENCY_DRILL_SUCCESS.md      # Procedures validadas
│   ├── SECURITY_STRATEGY_AMOY.md       # Estrategia seguridad
│   ├── BETA_TESTING_PLAN.md            # Plan beta (resumido)
│   ├── MINT_LOG.md                     # Logs de transacciones
│   └── GNOSIS_SAFE_SETUP.md            # Multi-sig (futuro)
├── archives/                           # Backups y docs obsoletas
│   ├── FINAL_VERIFICATION_COMPLETE.md  # Verificación final (redundante)
│   ├── RESUMEN_EJECUTIVO.md            # Info ahora en README principal
│   └── README.old.md                   # Backup del README anterior
├── contracts/                          # Smart contracts
├── scripts/                            # Scripts de deployment y operación
└── test/                               # Tests (si existen)
```

---

## 🎯 Orden de Lectura Recomendado

### Para Developers Nuevos
1. **[../README.md](../README.md)** - Overview y quick start
2. **[SECURITY_STRATEGY_AMOY.md](./SECURITY_STRATEGY_AMOY.md)** - Entender la estrategia
3. **[EMERGENCY_DRILL_SUCCESS.md](./EMERGENCY_DRILL_SUCCESS.md)** - Procedures críticas

### Para Beta Testing Coordinator
1. **[../GUIA_USUARIO_BETA.md](../GUIA_USUARIO_BETA.md)** - Guía para enviar a testers
2. **[BETA_TESTING_PLAN.md](./BETA_TESTING_PLAN.md)** - Cómo organizar el beta

### Para Mainnet Preparation
1. **[GNOSIS_SAFE_SETUP.md](./GNOSIS_SAFE_SETUP.md)** - Setup multi-sig
2. **[EMERGENCY_DRILL_SUCCESS.md](./EMERGENCY_DRILL_SUCCESS.md)** - Review procedures
3. **[SECURITY_STRATEGY_AMOY.md](./SECURITY_STRATEGY_AMOY.md)** - Adapt to mainnet

---

## ✅ Quick Reference

### Estado Actual del Sistema
```
Network: Polygon Amoy (Testnet)
Contract: 0x8a3b2D350890e23D5679a899070B462DfFEe0643
Total Supply: 115 SEMILLA
Status: ✅ Operational (not paused)
Backend: ✅ Connected and listening
```

### Emergency Commands
```bash
# Pause (emergency)
PAUSE_REASON="..." npx hardhat run scripts/emergency-pause.js --network amoy

# Unpause
npx hardhat run scripts/emergency-unpause.js --network amoy

# Check status
npx hardhat run scripts/check-all-balances.js --network amoy
```

### Links Rápidos
- **Contract:** https://amoy.polygonscan.com/address/0x8a3b2D350890e23D5679a899070B462DfFEe0643
- **Faucet POL:** https://faucet.polygon.technology/
- **Backend .env:** Necesita `AMOY_RPC_URL` y `SEMILLA_TOKEN_AMOY`

---

## 📞 Contacto

**Issues Técnicos:** GitHub Issues
**Security Issues:** Email privado (no abrir issues públicos)
**Beta Testing:** Discord/Telegram (TBD)

---

**Última actualización:** 2025-11-03
**Versión:** 1.0.0-beta
