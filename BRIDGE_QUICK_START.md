# Blockchain Bridges - Guía Rápida de Uso

## Inicio Rápido

El sistema de bridges permite a los usuarios transferir tokens SEMILLA entre la blockchain interna de Comunidad Viva y blockchains externas como Polygon y Solana.

## Acceso

**URL**: `http://localhost:3000/bridge`

**Acceso desde el menú**:
1. Click en "🚀 Plataforma" en el menú principal
2. Sección "💰 ECONOMÍA"
3. Click en "🌉 Blockchain Bridges"

## Requisitos Previos

### Para Usuario Final
- Cuenta registrada en Comunidad Viva
- SEMILLA tokens en tu balance
- Wallet externa (MetaMask para Polygon, Phantom para Solana)

### Para Desarrollo/Testing
- Cuenta en Alchemy o Infura para RPC URLs
- Wallet con fondos para gas en testnet (Mumbai o Solana Devnet)
- Contrato deployado (ver BRIDGE_DEPLOYMENT_GUIDE.md)

## Flujo de Uso: LOCK (Comunidad Viva → External Chain)

### Paso 1: Preparación
```bash
# Usuario debe tener SEMILLA en su balance
Balance mínimo: 100.1 SEMILLA (100 + 0.1 fee)
```

### Paso 2: Conectar Wallet Externa
1. Instalar MetaMask (para Polygon) o Phantom (para Solana)
2. Crear/importar wallet
3. Cambiar a red Mumbai testnet (Polygon) o Devnet (Solana)
4. En la página /bridge, click "Connect MetaMask"
5. Aprobar conexión en la extensión

### Paso 3: Iniciar Bridge
1. Seleccionar dirección: **"Lock SEMILLA → wSEMILLA"**
2. Elegir chain: **Polygon** o **Solana**
3. Ingresar cantidad: `100` SEMILLA
4. Verificar address externa (autocompletada desde wallet)
5. Revisar fee: `0.1 SEMILLA` (0.1%)
6. Click **"Bridge to Polygon"** (o Solana)

### Paso 4: Confirmación
```
✅ Bridge iniciado exitosamente!
⏳ Los tokens llegarán en ~30-60 segundos
🔗 Transaction ID: abc-123-def-456
```

### Paso 5: Verificación
1. **En Comunidad Viva**:
   - Balance reducido: `-100.1 SEMILLA`
   - Ver en historial: Status "PENDING" → "LOCKED" → "MINTED"

2. **En MetaMask/Phantom**:
   - Esperar ~30-60 segundos
   - Agregar token custom si es necesario:
     - Polygon: Contract address del .env
     - Symbol: `wSEMILLA`
     - Decimals: `2`
   - Ver balance: `100.00 wSEMILLA`

3. **En Block Explorer**:
   - Polygon: https://mumbai.polygonscan.com/tx/[TX_HASH]
   - Solana: https://explorer.solana.com/tx/[SIGNATURE]?cluster=devnet

## Flujo de Uso: UNLOCK (External Chain → Comunidad Viva)

### Paso 1: Quemar Tokens en Chain Externa

#### Opción A: Usando Polygonscan (Más fácil)
1. Ir a https://mumbai.polygonscan.com/address/[CONTRACT_ADDRESS]#writeContract
2. Connect wallet (MetaMask)
3. Función **bridgeBurn**:
   - `amount`: `10000` (100.00 con 2 decimals)
   - `gailuDID`: Tu DID (ej: `did:gailu:uuid`)
   - `bridgeRequestId`: Un ID único random (ej: `0x123...`)
4. Click "Write" y confirmar transacción
5. **Copiar transaction hash** (ej: `0xabc...`)

#### Opción B: Desde MetaMask Directamente
1. Abrir MetaMask
2. Enviar wSEMILLA al contrato con función `burn`
3. Copiar transaction hash

### Paso 2: Solicitar Unlock en Comunidad Viva
1. En `/bridge`, seleccionar: **"Unlock wSEMILLA → SEMILLA"**
2. Elegir chain: **Polygon** (o Solana)
3. Pegar **Transaction Hash**: `0xabc...`
4. Ingresar cantidad: `100`
5. Click **"Burn and Unlock"**

### Paso 3: Verificación del Sistema
```
⏳ Verificando burn transaction...
✅ Burn verificado correctamente
🔄 Procesando unlock... (1-2 minutos)
```

Worker automático verifica:
- Transaction existe en blockchain
- Cantidad coincide
- No está duplicada
- Tiene suficientes confirmaciones

### Paso 4: Recibir SEMILLA
```
✅ Unlock completado!
💰 Recibiste: 99.9 SEMILLA (100 - 0.1% fee)
```

Balance actualizado en Comunidad Viva.

## Endpoints API

### POST /bridge/lock
```bash
curl -X POST http://localhost:4000/bridge/lock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "targetChain": "POLYGON",
    "externalAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### POST /bridge/unlock
```bash
curl -X POST http://localhost:4000/bridge/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "sourceChain": "POLYGON",
    "externalTxHash": "0xabc123..."
  }'
```

### GET /bridge/transaction/:id
```bash
curl http://localhost:4000/bridge/transaction/abc-123 \
  -H "Authorization: Bearer $TOKEN"
```

### GET /bridge/history
```bash
curl http://localhost:4000/bridge/history?page=1&limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

### GET /bridge/stats
```bash
curl http://localhost:4000/bridge/stats
```

### GET /bridge/worker/status
```bash
curl http://localhost:4000/bridge/worker/status
```

## Estados de Bridge Transaction

| Estado | Descripción | Tiempo Estimado |
|--------|-------------|-----------------|
| `PENDING` | Solicitud creada, esperando procesamiento | Inmediato |
| `LOCKED` | SEMILLA bloqueada en sistema interno | <1 segundo |
| `MINTED` | Tokens minteados en chain externa (LOCK) | 30-60 segundos |
| `UNLOCKED` | SEMILLA desbloqueada en sistema (UNLOCK) | 1-2 minutos |
| `COMPLETED` | Proceso completado exitosamente | N/A |
| `FAILED` | Error durante el proceso | N/A |

## Comisiones

- **Bridge Fee**: 0.1% del monto transferido
- **Gas Fees** (pagados por el sistema):
  - Polygon: ~$0.001 USD
  - Solana: ~$0.0002 USD

**Ejemplo con 1000 SEMILLA**:
- Lock: Usuario paga 1 SEMILLA (0.1%), recibe 1000 wSEMILLA
- Unlock: Usuario paga 1 SEMILLA (0.1%), recibe 999 SEMILLA

## Límites y Restricciones

- **Monto mínimo**: 1 SEMILLA
- **Monto máximo**: Sin límite (sujeto a balance disponible)
- **Tiempo de procesamiento**:
  - LOCK: 30-60 segundos
  - UNLOCK: 1-2 minutos
- **Confirmaciones requeridas**:
  - Polygon: 12 blocks (~30 segundos)
  - Solana: 32 slots (~15 segundos)

## Troubleshooting

### Bridge se queda en PENDING
**Solución**:
1. Verificar que el worker esté corriendo: `GET /bridge/worker/status`
2. Revisar logs del backend
3. Verificar configuración de RPC URLs en .env
4. Verificar que el operador tenga fondos para gas

### Bridge marca FAILED
**Causas comunes**:
- Insufficient gas en wallet del operador
- RPC URL no responde
- Contract address incorrecto
- Network congestion

**Solución**:
```bash
# Retry manual
curl -X POST http://localhost:4000/bridge/retry/$BRIDGE_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Tokens no aparecen en MetaMask
**Solución**:
1. Agregar token custom manualmente
2. Verificar que estás en la red correcta (Mumbai)
3. Verificar transaction en Polygonscan
4. Esperar ~2 minutos adicionales

### UNLOCK no funciona
**Verificar**:
1. Transaction hash es correcta
2. Burn realmente se ejecutó en blockchain
3. Cantidad coincide exactamente
4. No se intentó unlock antes con el mismo tx hash

## Configuración para Producción

### Variables de Entorno
```bash
# .env
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_SEMILLA_CONTRACT=0x... # Contract en mainnet
POLYGON_BRIDGE_PRIVATE_KEY=0x... # Wallet con MATIC para gas

SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_SEMILLA_MINT=... # Mint address en mainnet
SOLANA_AUTHORITY_PRIVATE_KEY=[...]

BRIDGE_FEE_PERCENTAGE=0.1
```

### Seguridad
- Usar multisig wallet para bridge operator
- Monitorear balance de gas automáticamente
- Configurar alertas para bridges FAILED
- Rate limiting en endpoints públicos
- Backup de private keys en vault seguro

## Monitoreo

### Health Check
```bash
# Worker status
curl http://localhost:4000/bridge/worker/status

# Response
{
  "isProcessing": false,
  "pendingLocks": 0,
  "pendingUnlocks": 0,
  "failedBridges": 0,
  "polygon": {
    "connected": true,
    "chainId": 80001,
    "blockNumber": 45678901,
    "gasPrice": "1.5 gwei"
  }
}
```

### Métricas a Monitorear
- Pendiente de procesamiento: `pendingLocks + pendingUnlocks`
- Tasa de fallos: `failedBridges / totalBridges`
- Tiempo promedio de procesamiento
- Balance de gas del operador
- Gas price en cada network

## Testing

### Test Manual - Lock
```bash
# 1. Get auth token
TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Check balance
curl http://localhost:4000/federation/semilla/balance \
  -H "Authorization: Bearer $TOKEN"

# 3. Initiate bridge
curl -X POST http://localhost:4000/bridge/lock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "targetChain": "POLYGON",
    "externalAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }' | jq

# 4. Check status after 1 minute
BRIDGE_ID="..." # From step 3
curl http://localhost:4000/bridge/transaction/$BRIDGE_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test Manual - Unlock
```bash
# 1. Burn tokens on Polygonscan (ver arriba)
# 2. Copy transaction hash
# 3. Request unlock
curl -X POST http://localhost:4000/bridge/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "sourceChain": "POLYGON",
    "externalTxHash": "0xabc123..."
  }' | jq

# 4. Verify balance after 2 minutes
curl http://localhost:4000/federation/semilla/balance \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Recursos Adicionales

- **Documentación Completa**: `BRIDGE_SUMMARY.md`
- **Deployment Guide**: `BRIDGE_DEPLOYMENT_GUIDE.md`
- **Conceptual Guide**: `BLOCKCHAIN_BRIDGE_GUIDE.md`
- **API Reference**: `API_REFERENCE.md` (sección /bridge)
- **Smart Contract**: `packages/backend/contracts/polygon/WrappedSEMILLA.sol`

## Soporte

Para problemas o preguntas:
1. Revisar logs del backend: `packages/backend/logs/`
2. Consultar estado del worker: `GET /bridge/worker/status`
3. Revisar transacciones en block explorer
4. Contactar equipo de desarrollo con:
   - Bridge transaction ID
   - Error message
   - Logs relevantes
   - Screenshots si aplica
