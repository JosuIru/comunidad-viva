# 🔐 Estrategia de Seguridad - Polygon Amoy (Sin Gnosis Safe)

**Fecha:** 2025-11-03
**Decisión:** Continuar en Polygon Amoy sin Gnosis Safe por ahora
**Razón:** Gnosis Safe no tiene soporte UI para Amoy, zkEVM requiere faucet adicional

---

## 📊 Estado Actual

### Smart Contract Deployed
```
Network: Polygon Amoy Testnet
Contract: 0x8a3b2D350890e23D5679a899070B462DfFEe0643
Chain ID: 80002
Block Explorer: https://amoy.polygonscan.com/address/0x8a3b2D350890e23D5679a899070B462DfFEe0643
```

### Control y Permisos
```
Deployer Wallet: 0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf
Roles actuales:
  - MINTER_ROLE ✅
  - PAUSER_ROLE ✅
  - DEFAULT_ADMIN_ROLE ✅

⚠️ Una sola wallet tiene control total
```

### Tokens Minteados
```
Total Supply: 100 SEMILLA
  - 50 SEMILLA → 0x25Dd6346FE82E51001a9430CF07e8DeB84933627 (test)
  - 50 SEMILLA → 0xe88952fa33112ec58c83dae2974c0fef679b553d (Josu)
Remaining: 9,900 SEMILLA
```

---

## 🛡️ Medidas de Seguridad Actuales

### 1. Smart Contract Level (✅ Fuerte)

**Seguridad inherente:**
- ✅ 100% OpenZeppelin contracts (auditados profesionalmente)
- ✅ Límites conservadores:
  - MAX_MINT_AMOUNT: 100 SEMILLA/transacción
  - MAX_TOTAL_SUPPLY: 10,000 SEMILLA
- ✅ Pausable: Se puede pausar en emergencia
- ✅ Role-based access control
- ✅ No hay funciones de upgrade (inmutable)
- ✅ Código abierto y verificable

**Fortaleza:** 9/10

### 2. Network Level (✅ Fuerte)

**Seguridad de red:**
- ✅ Polygon es una red establecida y auditada
- ✅ RPC públicos disponibles (no dependencia)
- ✅ Block explorer funcionando (transparencia)
- ✅ Testnet: No hay dinero real en riesgo

**Fortaleza:** 8/10

### 3. Key Management (⚠️ Débil - ÚNICO PUNTO DE MEJORA)

**Situación actual:**
- ⚠️ Private key en archivo .env local
- ⚠️ Una sola wallet con control total
- ⚠️ Si se compromete la key = contrato comprometido

**Fortaleza:** 3/10

---

## 🎯 Estrategia de Mitigación (Sin Gnosis Safe)

### Corto Plazo (Testnet - Ahora)

**Es aceptable tener control single-wallet porque:**
1. **Es testnet** → No hay dinero real
2. **Límites conservadores** → Daño máximo limitado a 100 SEMILLA/tx
3. **Supply cap** → Máximo 10k SEMILLA totales
4. **Pausable** → Podemos detener el contrato si hay problema
5. **Duración limitada** → Solo 4-6 semanas de testnet

**Medidas de protección de la private key:**

#### A. Seguridad Local
```bash
# 1. Verificar permisos del .env
chmod 600 /home/josu/comunidad-viva/packages/blockchain/.env

# 2. Añadir .env a .gitignore (ya está, pero verificar)
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore

# 3. NUNCA commitear .env a git
git status # verificar que .env no aparece
```

#### B. Backup Seguro de la Key
```bash
# Crear backup encriptado (opcional)
# SOLO si quieres un backup extra
gpg -c /home/josu/comunidad-viva/packages/blockchain/.env
# Guarda el archivo .env.gpg en lugar seguro
# Elimina el .env.gpg del servidor después
```

#### C. Monitoreo de la Wallet
- Verificar balance regularmente
- Configurar alertas si alguien transfiere tokens sin autorización
- Revisar todas las transacciones en Polygonscan

#### D. Principio de Least Privilege
```javascript
// Cuando hagas mints manuales, usa scripts específicos
// NO exponer la private key en otros servicios
// Backend NO necesita private key para detectar eventos
```

### Mediano Plazo (Mainnet - Mes 4+)

**ANTES de ir a mainnet:**

**Opción 1: Gnosis Safe en Polygon Mainnet (RECOMENDADO)**
- Polygon mainnet SÍ tiene soporte de Gnosis Safe
- Configurar multi-sig 2-de-3 o 3-de-5
- Costo: $0 para crear Safe (solo gas normal)

**Opción 2: Gnosis Safe en zkEVM Mainnet**
- Si prefieres zkEVM en producción
- También tiene soporte completo de Safe

**Opción 3: Hardware Wallet + Multi-Sig Manual**
- Usar Ledger/Trezor para deployer wallet
- Implementar proceso manual de aprobación
- Menos conveniente pero más seguro que software wallet

---

## 📋 Protocolo de Seguridad para Beta Testing

### Reglas para Mintear Tokens

**Proceso:**
1. ✅ Solo mintear después de verificar identidad del usuario
2. ✅ Máximo 100 SEMILLA por usuario (límite del contrato)
3. ✅ Documentar cada mint (quién, cuánto, cuándo)
4. ✅ Verificar transaction confirmada antes de marcar como completada
5. ✅ NUNCA compartir private key con nadie

**Script seguro para mints:**
```bash
# Usar siempre scripts predefinidos
npx hardhat run scripts/mint-to-user.js --network amoy

# NUNCA mintear desde consola interactiva
# SIEMPRE usar scripts auditables
```

### Protocolo de Emergencia

**Si detectas actividad sospechosa:**

1. **PAUSAR INMEDIATAMENTE:**
```bash
npx hardhat run scripts/emergency-pause.js --network amoy
```

2. **Investigar:**
   - Ver todas las transacciones en Polygonscan
   - Identificar qué salió mal
   - Documentar el incidente

3. **Decidir:**
   - Si es bug del contrato → Deploy nuevo contrato
   - Si es compromiso de key → Deploy nuevo contrato con nueva key
   - Si es false alarm → Unpause

4. **Comunicar:**
   - Informar a todos los beta testers
   - Explicar qué pasó
   - Documentar aprendizajes

### Script de Pausa de Emergencia

Voy a crear el script ahora:

```javascript
// scripts/emergency-pause.js
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8a3b2D350890e23D5679a899070B462DfFEe0643";
  const reason = process.env.PAUSE_REASON || "Emergency pause";

  console.log("\n⚠️  EMERGENCY PAUSE");
  console.log("==================");
  console.log("Contract:", contractAddress);
  console.log("Reason:", reason);

  const token = await hre.ethers.getContractAt("SemillaToken", contractAddress);

  // Verificar que no esté ya pausado
  const isPaused = await token.paused();
  if (isPaused) {
    console.log("\n⚠️  Contract is already paused!");
    process.exit(0);
  }

  console.log("\n🔨 Pausing contract...");
  const tx = await token.pause();
  console.log("Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✅ Contract PAUSED");

  console.log("\n⚠️  All transfers, mints, and burns are now DISABLED");
  console.log("\nTo unpause:");
  console.log("npx hardhat run scripts/emergency-unpause.js --network amoy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## 🔍 Monitoreo y Auditoría

### Logs de Transacciones

**Crear archivo de registro:**
```bash
# packages/blockchain/MINT_LOG.md
```

**Formato:**
```markdown
## Mint History

### 2025-11-03
- **User:** Josu (0xe88952fa33112ec58c83dae2974c0fef679b553d)
- **Amount:** 50 SEMILLA
- **Tx:** 0x7abcb8d3f9919a6ff45d19d38c49ebb879e7b6d4469b3ab7b49e9664bd8407fa
- **Purpose:** Initial test
- **Approved by:** Deployer

### 2025-11-04
- **User:** Beta Tester 1 (0x...)
- **Amount:** 25 SEMILLA
- **Tx:** 0x...
- **Purpose:** Beta testing
- **Approved by:** Deployer
```

### Verificaciones Regulares

**Daily:**
- [ ] Verificar balance de deployer wallet (no debe cambiar inesperadamente)
- [ ] Revisar transacciones en Polygonscan
- [ ] Verificar Total Supply (debe coincidir con log manual)

**Weekly:**
- [ ] Backup de MINT_LOG.md
- [ ] Revisar todos los holders del token
- [ ] Verificar que no hay actividad no autorizada

---

## ✅ Checklist de Seguridad para Beta Testing

### Antes de Empezar Beta
- [x] Contract deployed y verificado
- [x] Límites configurados correctamente
- [ ] Emergency pause script probado
- [ ] Emergency unpause script probado
- [ ] MINT_LOG.md creado
- [ ] Proceso de mint documentado
- [ ] Protocolo de emergencia documentado
- [ ] Beta testers informados de que es testnet

### Durante Beta (Cada Mint)
- [ ] Verificar identidad del usuario
- [ ] Documentar en MINT_LOG.md
- [ ] Ejecutar mint script
- [ ] Verificar transaction confirmada
- [ ] Informar al usuario
- [ ] Actualizar Total Supply en log

### Post-Beta (Antes de Mainnet)
- [ ] Revisar todos los logs
- [ ] Identificar issues de seguridad
- [ ] Decidir: Gnosis Safe en mainnet (SÍ)
- [ ] Preparar nueva key para mainnet (diferente de testnet)
- [ ] Documentar lecciones aprendidas

---

## 🎓 Lecciones de Seguridad

### Lo Que Hicimos Bien ✅

1. **OpenZeppelin 100%** → Código battle-tested
2. **Límites conservadores** → Daño máximo limitado
3. **Pausable** → Circuit breaker funcionando
4. **Testnet primero** → No arriesgar dinero real
5. **Documentación completa** → Rastreabilidad

### Lo Que Podemos Mejorar ⚠️

1. **Multi-sig** → Implementar en mainnet
2. **Hardware wallet** → Para mainnet deployment
3. **Monitoring automatizado** → Alertas automáticas
4. **Incident response** → Practicar simulacros

---

## 🚀 Roadmap de Seguridad

### Testnet (Próximas 4-6 Semanas)
```
✅ Week 1: Beta testing con seguridad básica
✅ Week 2-3: Monitoreo activo, documentar todo
✅ Week 4-5: Simular emergency scenarios
✅ Week 6: Revisar y preparar para mainnet
```

### Pre-Mainnet (Mes 3-4)
```
⏳ Crear Gnosis Safe en Polygon mainnet
⏳ Conseguir hardware wallet (Ledger/Trezor)
⏳ Configurar monitoring automatizado
⏳ Community code review
```

### Mainnet (Mes 4+)
```
⏳ Deploy con nueva private key
⏳ Transfer ownership a Safe inmediatamente
⏳ Empezar con límites muy conservadores
⏳ Monitor 24/7 primera semana
```

---

## 💡 Conclusión

**Para testnet (ahora):** La seguridad actual es SUFICIENTE porque:
- ✅ Es testnet (no hay dinero real)
- ✅ Límites conservadores
- ✅ OpenZeppelin battle-tested
- ✅ Pausable
- ✅ Duración limitada (4-6 semanas)

**Para mainnet (futuro):** DEBEMOS mejorar:
- ⚠️ Gnosis Safe multi-sig (obligatorio)
- ⚠️ Hardware wallet (altamente recomendado)
- ⚠️ Monitoring automatizado (recomendado)

**La estrategia es:**
Usar testnet para aprender y validar, luego aplicar máxima seguridad en mainnet.

---

**Status:** ✅ Seguridad apropiada para fase de testnet
**Next Review:** Antes de mainnet deployment (mes 4)
