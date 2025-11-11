# 🔐 Gnosis Safe Setup Guide

**Tiempo estimado:** 15-20 minutos
**Costo:** $0 (gratis en testnet)

---

## 📋 Paso 1: Preparar MetaMask (5 minutos)

### 1.1 Añadir Polygon Amoy a MetaMask

1. Abrir MetaMask
2. Click en el selector de red (arriba izquierda)
3. Click en "Add network" o "Añadir red"
4. Click en "Add network manually" o "Añadir red manualmente"

**Configuración de red:**
```
Network name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency symbol: POL
Block explorer: https://amoy.polygonscan.com
```

5. Click "Save" o "Guardar"
6. Cambiar a la red Polygon Amoy

### 1.2 Obtener POL de testnet (si no tienes)

Si tu wallet necesita POL para gas:

1. Ir a: https://faucet.polygon.technology/
2. Seleccionar: **Polygon Amoy**
3. Conectar wallet o pegar address
4. Request 0.5 POL
5. Esperar 1-2 minutos

---

## 📋 Paso 2: Crear Gnosis Safe (10 minutos)

### 2.1 Ir a Gnosis Safe App

Abrir: https://app.safe.global/

### 2.2 Conectar Wallet

1. Click "Connect wallet"
2. Seleccionar MetaMask
3. Aprobar conexión
4. **IMPORTANTE:** Asegurarte que estás en red **Polygon Amoy**

### 2.3 Crear Nuevo Safe

1. Click en "+ Create new Safe" o "Crear nuevo Safe"
2. Seleccionar red: **Polygon Amoy**
3. Click "Continue"

### 2.4 Configurar Owners (Signers)

**Opción Recomendada 1: 2 de 3 signers**
```
Owner 1: Tu wallet principal
Owner 2: Una wallet secundaria tuya
Owner 3: Wallet de un co-founder o persona de confianza

Threshold: 2 (se necesitan 2 firmas de 3)
```

**Opción Recomendada 2: 3 de 5 signers**
```
Owner 1-5: Diferentes wallets de tu equipo

Threshold: 3 (se necesitan 3 firmas de 5)
```

**Para testing solo (NO para producción):**
```
Owner 1: Tu wallet
Owner 2: Una segunda wallet tuya

Threshold: 1 (solo necesitas 1 firma)
```

### 2.5 Nombrar el Safe

```
Safe name: SemillaToken Admin
```

### 2.6 Review y Deploy

1. Revisar configuración
2. Click "Create"
3. Confirmar transacción en MetaMask
4. Esperar confirmación (~10-30 segundos)

### 2.7 ¡Safe Creado! 🎉

Verás la dirección de tu Safe. **Cópiala**, la necesitarás para el siguiente paso.

Ejemplo: `0x1234567890abcdef1234567890abcdef12345678`

---

## 📋 Paso 3: Transfer Ownership del Contrato (5 minutos)

### 3.1 Ejecutar Script de Transfer

En tu terminal:

```bash
cd /home/josu/comunidad-viva/packages/blockchain

# Reemplaza 0xYourSafeAddress con la address de tu Safe
GNOSIS_SAFE_ADDRESS=0xYourSafeAddress npx hardhat run scripts/transfer-ownership.js --network amoy
```

**Output esperado:**
```
🔗 Connecting to SemillaToken...
Contract: 0x8a3b2D350890e23D5679a899070B462DfFEe0643
Network: amoy
Deployer: 0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf

🔐 Transferring ownership to Gnosis Safe...
Safe Address: 0xYourSafeAddress

📋 Role Hashes:
MINTER_ROLE: 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
PAUSER_ROLE: 0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a
DEFAULT_ADMIN_ROLE: 0x0000000000000000000000000000000000000000000000000000000000000000

🔍 Current roles:
Deployer has MINTER_ROLE: true
Deployer has PAUSER_ROLE: true
Deployer has DEFAULT_ADMIN_ROLE: true

📝 Granting roles to Gnosis Safe...
⏳ Granting MINTER_ROLE... tx: 0xabc123...
✅ MINTER_ROLE granted to Safe

⏳ Granting PAUSER_ROLE... tx: 0xdef456...
✅ PAUSER_ROLE granted to Safe

⏳ Granting DEFAULT_ADMIN_ROLE... tx: 0x789ghi...
✅ DEFAULT_ADMIN_ROLE granted to Safe

🗑️  Revoking roles from deployer...
⏳ Revoking MINTER_ROLE... tx: 0xjkl012...
✅ MINTER_ROLE revoked from deployer

⏳ Revoking PAUSER_ROLE... tx: 0xmno345...
✅ PAUSER_ROLE revoked from deployer

⏳ Renouncing DEFAULT_ADMIN_ROLE... tx: 0xpqr678...
✅ DEFAULT_ADMIN_ROLE renounced by deployer

🔍 Final verification:
Safe has MINTER_ROLE: true ✅
Safe has PAUSER_ROLE: true ✅
Safe has DEFAULT_ADMIN_ROLE: true ✅
Deployer still has MINTER_ROLE: false ✅
Deployer still has PAUSER_ROLE: false ✅
Deployer still has DEFAULT_ADMIN_ROLE: false ✅

🎉 ¡OWNERSHIP TRANSFERRED SUCCESSFULLY!

⚠️  IMPORTANTE:
   ✅ Deployer wallet NO tiene ningún control
   ✅ SOLO Gnosis Safe puede mint/pause/admin
   ✅ Se requieren múltiples firmas para cualquier acción

📝 Próximo paso:
   - Probar mint desde Gnosis Safe UI
   - Verificar que backend detecta el evento
```

---

## 📋 Paso 4: Test Mint desde Gnosis Safe (10 minutos)

### 4.1 Abrir Safe

1. Ir a https://app.safe.global/
2. Seleccionar tu Safe (SemillaToken Admin)
3. Asegurarte que estás en red Polygon Amoy

### 4.2 Nueva Transacción

1. Click en "New transaction"
2. Seleccionar "Contract interaction"

### 4.3 Configurar Contract

**Contract address:**
```
0x8a3b2D350890e23D5679a899070B462DfFEe0643
```

**ABI:** Copiar y pegar el contenido de:
```
/home/josu/comunidad-viva/packages/backend/src/federation/abis/SemillaToken.abi.json
```

O usar este ABI mínimo:
```json
[
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

### 4.4 Llamar función mint

**Method:** `mint`

**Parámetros:**

1. **to (address):**
   - Pegar una address de prueba (puede ser tu propia wallet)
   - Ejemplo: `0xYourTestAddress`

2. **amount (uint256):**
   - Para 50 SEMILLA: `50000000000000000000`
   - Para 10 SEMILLA: `10000000000000000000`
   - Para 1 SEMILLA: `1000000000000000000`

   **Nota:** 18 ceros porque SEMILLA tiene 18 decimales

### 4.5 Submit Transaction

1. Click "Add transaction" o "Submit"
2. Revisar detalles
3. Click "Create" o "Crear"

### 4.6 Aprobar con Signers

Si tu Safe requiere 2 de 3 firmas:

1. **Signer 1 (tú):**
   - La transacción aparecerá en "Pending"
   - Click "Confirm"
   - Firmar en MetaMask

2. **Signer 2:**
   - Conectar con la segunda wallet
   - Ir al Safe
   - Ver transacción en "Pending"
   - Click "Confirm"
   - Firmar en MetaMask

3. Una vez alcanzado el threshold, aparecerá botón "Execute"

### 4.7 Execute Transaction

1. Click "Execute"
2. Confirmar en MetaMask
3. Esperar confirmación (~10-30 segundos)

### 4.8 ¡Mint Exitoso! 🎉

Verás:
- Transaction hash
- Status: Success
- Event logs mostrando TokensMinted

---

## 📋 Paso 5: Verificar Backend Detecta el Evento (2 minutos)

### 5.1 Check Backend Logs

En tu terminal donde corre el backend, deberías ver:

```
[BlockchainService] 💰 TokensMinted on amoy: 50.0 SEMILLA to 0xTestAddress...
[BlockchainService] ⚠️  No pending transaction found for mint to 0xTestAddress on amoy
```

O si había una transacción pendiente:
```
[BlockchainService] 💰 TokensMinted on amoy: 50.0 SEMILLA to 0xTestAddress...
[BlockchainService] ✅ Bridge transaction abc-123 marked as MINTED
```

### 5.2 Verificar en Block Explorer

Ir a:
```
https://amoy.polygonscan.com/address/0x8a3b2D350890e23D5679a899070B462DfFEe0643
```

En la pestaña "Events" deberías ver:
- Event: `TokensMinted`
- Topics: to address, amount, minter (Safe address)

### 5.3 Check Balance

Puedes verificar el balance del receptor:

```bash
cd /home/josu/comunidad-viva/packages/blockchain
npx hardhat console --network amoy
```

```javascript
const token = await ethers.getContractAt(
  "SemillaToken",
  "0x8a3b2D350890e23D5679a899070B462DfFEe0643"
);

// Check balance
const balance = await token.balanceOf("0xTestAddress");
console.log("Balance:", ethers.formatEther(balance), "SEMILLA");

// Check total supply
const supply = await token.totalSupply();
console.log("Total Supply:", ethers.formatEther(supply), "SEMILLA");
```

---

## ✅ Checklist de Completitud

- [ ] MetaMask configurado con Polygon Amoy
- [ ] Wallet tiene POL para gas
- [ ] Gnosis Safe creado
- [ ] Safe tiene 2+ signers configurados
- [ ] Ownership transferido al Safe
- [ ] Deployer wallet NO tiene roles
- [ ] Safe tiene todos los roles (MINTER, PAUSER, ADMIN)
- [ ] Test mint ejecutado exitosamente
- [ ] Backend detectó el evento TokensMinted
- [ ] Balance verificado en block explorer

---

## 🆘 Troubleshooting

### Error: "Transaction will fail"
- **Causa:** Safe no tiene roles todavía
- **Solución:** Ejecutar script de transfer-ownership

### Error: "Insufficient funds"
- **Causa:** Safe no tiene POL para gas
- **Solución:** Enviar POL al Safe desde el faucet

### Backend no detecta evento
- **Causa:** Backend no está corriendo o contract address incorrecto
- **Solución:**
  1. Verificar backend corriendo: `ps aux | grep nest`
  2. Verificar .env tiene: `SEMILLA_TOKEN_AMOY=0x8a3b2...`
  3. Reiniciar backend: `cd packages/backend && npm run dev`

### No aparece para firmar en segunda wallet
- **Causa:** Wallet no es signer del Safe
- **Solución:** Ir a Safe settings y añadir como owner

---

## 📝 Próximos Pasos Después del Setup

1. **Documentar Safe address:**
   - Añadir a README
   - Compartir con team
   - Backup de recovery phrase

2. **Test todas las funciones:**
   - mint ✅
   - burn (cuando implementes reverse bridge)
   - pause (en caso de emergencia)
   - unpause

3. **Beta testing:**
   - Invitar usuarios
   - Mintear SEMILLA a beta testers
   - Documentar feedback

4. **Monitoring:**
   - Check events diariamente
   - Revisar gas costs
   - Asegurar backend siempre corriendo

---

## 🔗 Links Útiles

- **Gnosis Safe App:** https://app.safe.global/
- **SemillaToken Contract:** https://amoy.polygonscan.com/address/0x8a3b2D350890e23D5679a899070B462DfFEe0643
- **Amoy Faucet:** https://faucet.polygon.technology/
- **Gnosis Safe Docs:** https://docs.safe.global/

---

> **"Una vez completado este setup, tu smart contract está 100% controlado por multi-sig. Máxima seguridad. ✅"**

**¡Éxito! 🚀**
