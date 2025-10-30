# 🚀 Guía de Deployment - SEMILLA Bridges

Esta guía te ayudará a desplegar el sistema completo de bridges para SEMILLA tokens.

---

## 📋 Requisitos Previos

### 1. **Cuenta en Polygon**
- [ ] Wallet con MATIC para gas fees (~10 MATIC recomendado)
- [ ] Private key de la wallet (¡NUNCA compartir!)
- [ ] RPC endpoint (puedes usar el público o Alchemy/Infura)

### 2. **Node.js y Dependencias**
```bash
# Instalar dependencias de contratos
cd packages/backend
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Instalar ethers.js para interactuar con contratos
npm install ethers@^6
```

### 3. **Variables de Entorno**
Agrega estas variables a tu `.env`:

```env
# Polygon Mainnet
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_DEPLOYER_PRIVATE_KEY=tu_private_key_aqui
POLYGON_BRIDGE_PRIVATE_KEY=tu_private_key_para_bridge_operations
POLYGONSCAN_API_KEY=tu_api_key_de_polygonscan

# Polygon Mumbai Testnet (para testing)
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Después del deployment, agregar:
POLYGON_SEMILLA_CONTRACT=0x...  # Address del contrato desplegado
BRIDGE_OPERATOR_ADDRESS=0x...   # Address que ejecutará bridges
```

---

## 🔧 Paso 1: Desplegar Contrato en Polygon

### Opción A: Testnet (Mumbai) - RECOMENDADO para probar

```bash
cd packages/backend

# 1. Obtener MATIC gratis de faucet
# Visita: https://faucet.polygon.technology/

# 2. Desplegar contrato
npx hardhat run contracts/polygon/deploy.js --network mumbai
```

### Opción B: Mainnet (Producción)

```bash
cd packages/backend

# ⚠️ ADVERTENCIA: Esto gastará MATIC real
npx hardhat run contracts/polygon/deploy.js --network polygon
```

### Resultado Esperado:
```
🚀 Deploying WrappedSEMILLA to mumbai
⏳ Please wait...

📝 Deploying with account: 0xYourAddress
💰 Account balance: 10.5 MATIC

🌉 Bridge operator: 0xYourAddress
👤 Admin: 0xYourAddress

📦 Deploying WrappedSEMILLA contract...
✅ WrappedSEMILLA deployed to: 0x123ABC...

📋 Contract Details:
   Name: Wrapped SEMILLA
   Symbol: wSEMILLA
   Decimals: 2
   Total Supply: 0

⏳ Waiting for 5 block confirmations...
✅ Confirmed!

🔍 Verifying contract on Polygonscan...
✅ Contract verified!

📝 Next Steps:
1. Add this contract address to your .env file:
   POLYGON_SEMILLA_CONTRACT=0x123ABC...
```

### 💾 Guardar Información del Deployment

Copia el contract address y agrégalo a tu `.env`:
```env
POLYGON_SEMILLA_CONTRACT=0x123ABC...
```

---

## 🔑 Paso 2: Configurar Bridge Operator

El bridge operator es la cuenta que ejecutará las operaciones de mint/burn automáticamente.

### Opción A: Usar la misma wallet del deployer

Ya está configurado si usas la misma private key.

### Opción B: Usar una wallet separada (RECOMENDADO)

```bash
# 1. Crear nueva wallet para bridge operations
# Guarda la private key en POLYGON_BRIDGE_PRIVATE_KEY

# 2. Grant BRIDGE_ROLE a la nueva wallet
npx hardhat console --network mumbai
```

En la consola de Hardhat:
```javascript
const contract = await ethers.getContractAt(
  "WrappedSEMILLA",
  "0xTU_CONTRACT_ADDRESS"
);

// Grant BRIDGE_ROLE
await contract.addBridgeOperator("0xNUEVA_WALLET_ADDRESS");

// Verificar
const hasBridgeRole = await contract.hasRole(
  await contract.BRIDGE_ROLE(),
  "0xNUEVA_WALLET_ADDRESS"
);
console.log("Has BRIDGE_ROLE:", hasBridgeRole);
```

---

## 🏃 Paso 3: Iniciar Backend con Bridge Worker

```bash
cd packages/backend

# El backend ya incluye el worker service
npm run dev
```

### Verificar que el Worker está activo:

Busca en los logs:
```
[BridgeWorkerService] Bridge Worker Service initialized
[BridgeWorkerService] ✅ Polygon service connected and ready
```

---

## 🧪 Paso 4: Probar el Bridge

### Test 1: Lock SEMILLA y Mint en Polygon

```bash
# 1. Asegúrate de tener SEMILLA en tu cuenta interna
# 2. Hacer request de bridge

curl -X POST http://localhost:4000/bridge/lock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "targetChain": "POLYGON",
    "externalAddress": "0xTU_WALLET_METAMASK"
  }'
```

**Respuesta:**
```json
{
  "id": "uuid-del-bridge",
  "status": "PENDING",
  "amount": 100,
  "targetChain": "POLYGON",
  "externalAddress": "0xTU_WALLET..."
}
```

### Test 2: Verificar Estado del Bridge

```bash
# El worker procesará el bridge en ~30 segundos
curl http://localhost:4000/bridge/transaction/UUID_DEL_BRIDGE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta cuando complete:**
```json
{
  "id": "uuid",
  "status": "MINTED",
  "externalTxHash": "0x7abc...",
  "completedAt": "2025-10-30T..."
}
```

### Test 3: Ver Tokens en MetaMask

1. Abre MetaMask
2. Cambia a red Polygon Mumbai
3. Click "Import Token"
4. Pega el contract address: `0xTU_CONTRACT_ADDRESS`
5. ¡Deberías ver tus 100 wSEMILLA!

---

## 📊 Paso 5: Monitorear Bridges

### Endpoint de Estado del Worker

```bash
curl http://localhost:4000/bridge/stats
```

**Respuesta:**
```json
{
  "isProcessing": false,
  "pendingLocks": 0,
  "pendingUnlocks": 0,
  "failedBridges": 0,
  "polygon": {
    "connected": true,
    "chainId": 80001,
    "blockNumber": 42518234,
    "gasPrice": "1.5"
  }
}
```

### Ver Historial de Bridges

```bash
curl http://localhost:4000/bridge/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔄 Paso 6: Desplegar en Producción

### Checklist de Seguridad:

- [ ] **Private Keys**
  - Nunca en código fuente
  - Usar variables de entorno
  - Rotar periódicamente

- [ ] **Monitoreo**
  - Configurar alertas para bridges fallidos
  - Monitor de saldo de MATIC
  - Logs centralizados

- [ ] **Límites**
  - Configurar límites máximos por bridge
  - Rate limiting en API
  - Montos mínimos razonables

- [ ] **Testing**
  - Probar exhaustivamente en Mumbai
  - Bridges de cantidades pequeñas primero
  - Verificar todos los casos de error

### Deployment a Mainnet:

```bash
# 1. Asegurarse de tener suficiente MATIC
# 2. Verificar todas las variables de entorno
# 3. Desplegar contrato
npx hardhat run contracts/polygon/deploy.js --network polygon

# 4. Verificar en Polygonscan
# https://polygonscan.com/address/0xTU_CONTRACT

# 5. Actualizar .env con contract address de mainnet

# 6. Reiniciar backend
npm run build
pm2 restart backend
```

---

## 🐛 Troubleshooting

### Error: "Polygon service not initialized"

**Solución:**
- Verifica que `POLYGON_RPC_URL` esté configurado
- Verifica que `POLYGON_SEMILLA_CONTRACT` esté configurado
- Revisa los logs del backend al iniciar

### Error: "Insufficient MATIC balance"

**Solución:**
- La wallet de bridge operations necesita MATIC para gas
- Enviar al menos 1 MATIC a la wallet
- En Mumbai, usar faucet: https://faucet.polygon.technology/

### Bridge se queda en "PENDING"

**Solución:**
- Verificar que el worker esté corriendo
- Revisar logs del worker service
- Verificar que la wallet tenga MATIC
- Intentar retry: `POST /bridge/retry/:bridgeId`

### Tokens no aparecen en MetaMask

**Solución:**
- Verificar que estás en la red correcta (Mumbai/Polygon)
- Importar token manualmente con contract address
- Verificar el bridge en Polygonscan

---

## 💰 Costos Estimados

### Mumbai (Testnet)
- Deploy contrato: GRATIS (faucet)
- Cada mint: GRATIS (faucet)
- Total: **$0**

### Polygon Mainnet
- Deploy contrato: ~0.05 MATIC (~$0.04)
- Cada mint: ~0.002 MATIC (~$0.0016)
- 1000 bridges: ~$1.60
- Total mes (estimado): **$5-10**

---

## 📚 Recursos Adicionales

- **Polygon Docs**: https://docs.polygon.technology/
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js Docs**: https://docs.ethers.org/
- **Mumbai Faucet**: https://faucet.polygon.technology/
- **Polygonscan (Mumbai)**: https://mumbai.polygonscan.com/
- **Polygonscan (Mainnet)**: https://polygonscan.com/

---

## 🎯 Próximos Pasos

Después de deployment exitoso:

1. [ ] Crear interfaz de usuario para bridges
2. [ ] Agregar soporte para Solana
3. [ ] Implementar sistema de recompensas por liquidez
4. [ ] Crear mercado DEX para wSEMILLA
5. [ ] Documentar casos de uso para usuarios finales

---

**¿Problemas? Abre un issue en GitHub o contacta al equipo de desarrollo.**

**Última actualización:** 2025-10-30
**Versión:** 1.0.0
