# 🌉 Guía de Bridges - SEMILLA Token

## Resumen

El sistema de **bridges (puentes)** permite a los usuarios mover tokens SEMILLA entre la blockchain interna de Gailu Labs y otras blockchains de bajo costo como **Polygon** y **Solana**.

---

## 🎯 ¿Por qué Bridges?

### Problema
- **Ethereum** cobra comisiones altísimas ($10-$50 por transacción)
- Los usuarios no pueden usar MetaMask/Phantom con SEMILLA
- Imposible hacer trading de SEMILLA en exchanges

### Solución: Multi-Chain
```
┌──────────────────────────────────────────────────┐
│   Gailu Labs Blockchain (Interna)               │
│   ✅ Gratis                                      │
│   ✅ Instantánea                                 │
│   ✅ Control total                               │
└─────────────┬────────────────────────────────────┘
              │
       ┌──────┴──────┐
       │   BRIDGES   │
       └──────┬──────┘
              │
    ┌─────────┴─────────────┐
    │                       │
┌───▼───────┐       ┌───────▼────┐
│  POLYGON  │       │   SOLANA   │
│  wSEMILLA │       │   wSEMILLA │
│           │       │            │
│ $0.001/tx │       │ $0.0002/tx │
│ MetaMask  │       │  Phantom   │
└───────────┘       └────────────┘
```

---

## 🔗 Blockchains Soportadas

| Red | Comisión | Velocidad | Wallet | Uso Recomendado |
|-----|----------|-----------|---------|-----------------|
| **Polygon** | ~$0.001 | 2 seg | MetaMask | Trading, DeFi |
| **Solana** | ~$0.0002 | 400ms | Phantom | Pagos rápidos |
| **Arbitrum** | ~$0.01 | 1 seg | MetaMask | Seguridad extra |
| **BSC** | ~$0.05 | 3 seg | MetaMask | Compatible con Binance |

---

## 🚀 Cómo Funciona

### 1. **Lock & Bridge** (Interno → Externo)

```typescript
// Usuario quiere mover 100 SEMILLA a Polygon
POST /bridge/lock
{
  "amount": 100,
  "targetChain": "POLYGON",
  "externalAddress": "0xabc123..."  // Tu wallet de MetaMask
}
```

**Proceso:**
1. ✅ Se bloquean 100 SEMILLA en la blockchain interna
2. ⏳ Se emiten 100 wSEMILLA (wrapped SEMILLA) en Polygon
3. 💰 Comisión: 0.5 SEMILLA

**Resultado:**
- Ahora tienes 100 wSEMILLA en tu MetaMask
- Puedes usar en Uniswap, QuickSwap, etc.

---

### 2. **Burn & Unlock** (Externo → Interno)

```typescript
// Usuario quiere regresar 50 wSEMILLA de Polygon
POST /bridge/unlock
{
  "amount": 50,
  "sourceChain": "POLYGON",
  "externalTxHash": "0x7def456..."  // Hash de transacción de Polygon
}
```

**Proceso:**
1. 🔥 Se queman 50 wSEMILLA en Polygon
2. ✅ Se desbloquean 50 SEMILLA en blockchain interna
3. 💰 Comisión: 0.5 SEMILLA

**Resultado:**
- Recuperas 49.5 SEMILLA en tu cuenta interna

---

## 📊 API Endpoints

### GET /bridge/chains
Obtener redes soportadas y sus configuraciones

**Response:**
```json
[
  {
    "chain": "POLYGON",
    "name": "Polygon",
    "minAmount": 10,
    "fee": 0.5
  },
  {
    "chain": "SOLANA",
    "name": "Solana",
    "minAmount": 1,
    "fee": 0.1
  }
]
```

---

### GET /bridge/history
Obtener historial de bridges del usuario

**Response:**
```json
[
  {
    "id": "uuid",
    "amount": 100,
    "direction": "LOCK",
    "targetChain": "POLYGON",
    "status": "MINTED",
    "externalTxHash": "0x...",
    "createdAt": "2025-10-30T...",
    "completedAt": "2025-10-30T..."
  }
]
```

---

### GET /bridge/stats
Estadísticas globales del bridge

**Response:**
```json
{
  "totalBridged": 50000,
  "totalLocked": 30000,
  "totalUnlocked": 20000,
  "byChain": [
    {
      "chain": "POLYGON",
      "totalAmount": 35000,
      "transactionCount": 450
    },
    {
      "chain": "SOLANA",
      "totalAmount": 15000,
      "transactionCount": 800
    }
  ]
}
```

---

## 💡 Casos de Uso

### 1. **Trading en DEX**
```
1. Bridge 1000 SEMILLA → Polygon
2. Agregar liquidez en QuickSwap (SEMILLA/USDC)
3. Ganar comisiones de trading
4. Bridge de vuelta cuando quieras
```

### 2. **Pagos Internacionales**
```
1. Bridge SEMILLA → Solana (ultra-rápido)
2. Enviar a wallet de cualquier país
3. Destinatario puede bridge a su blockchain local
4. Total: <$0.01 de comisión
```

### 3. **Ahorro en DeFi**
```
1. Bridge a Polygon
2. Depositar en Aave, Compound, etc.
3. Ganar intereses
4. Retirar cuando quieras
```

---

## 🔒 Seguridad

### ¿Cómo se garantiza la seguridad?

1. **Lock-Mint Pattern**
   - SEMILLA nunca se pierde, solo se bloquea
   - Cada wSEMILLA tiene respaldo 1:1

2. **Verificación de Transacciones**
   - Cada bridge verifica la transacción en ambas chains
   - No se puede hacer doble gasto

3. **Límites de Seguridad**
   - Mínimos por transacción (evita spam)
   - Comisiones (mantienen el sistema sostenible)

---

## 🛠 Para Desarrolladores

### Próximos Pasos de Implementación

1. **Smart Contracts en Polygon**
   - Desplegar contrato ERC-20 de wSEMILLA
   - Implementar funciones mint/burn con autorización

2. **Worker Service**
   - Servicio que escucha bridges pendientes
   - Ejecuta transacciones en blockchain externa
   - Actualiza estados en base de datos

3. **Monitoring**
   - Dashboard de bridges en tiempo real
   - Alertas de bridges fallidos
   - Métricas de uso

---

## 📝 Configuración

### Variables de Entorno

```env
# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_SEMILLA_CONTRACT=0x...  # Contrato desplegado
POLYGON_PRIVATE_KEY=xxx  # Para ejecutar transacciones

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_SEMILLA_MINT=xxx  # Token mint address
SOLANA_PRIVATE_KEY=xxx
```

---

## 🎓 Ejemplo Completo

```typescript
// 1. Usuario consulta redes disponibles
const chains = await fetch('/bridge/chains').then(r => r.json());
// [{chain: 'POLYGON', minAmount: 10, fee: 0.5}, ...]

// 2. Usuario hace bridge a Polygon
const lockResponse = await fetch('/bridge/lock', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100,
    targetChain: 'POLYGON',
    externalAddress: '0x123...' // MetaMask address
  })
});

const bridgeTx = await lockResponse.json();
// {id: 'uuid', status: 'PENDING', ...}

// 3. Esperar confirmación (polling o websocket)
const checkStatus = async (txId) => {
  const status = await fetch(`/bridge/transaction/${txId}`).then(r => r.json());
  if (status.status === 'MINTED') {
    console.log('¡Bridge completado! Revisa tu MetaMask');
    console.log('TX Hash:', status.externalTxHash);
  } else if (status.status === 'FAILED') {
    console.error('Bridge falló:', status.error);
  }
};

// 4. Después de usar wSEMILLA en Polygon, hacer bridge de vuelta
const unlockResponse = await fetch('/bridge/unlock', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 95,
    sourceChain: 'POLYGON',
    externalTxHash: '0xabc...' // TX hash de burn en Polygon
  })
});
```

---

## ❓ FAQ

### ¿Cuánto tarda un bridge?
- **Polygon**: 2-5 minutos
- **Solana**: 30 segundos - 2 minutos

### ¿Puedo cancelar un bridge?
No, una vez iniciado no se puede cancelar. Los tokens se bloquean inmediatamente.

### ¿Qué pasa si falla?
Los tokens quedan bloqueados pero puedes contactar soporte. Implementaremos un sistema de recuperación automática.

### ¿Hay límites?
- **Mínimo**: 10 SEMILLA para Polygon, 1 SEMILLA para Solana
- **Máximo**: Sin límite (por ahora)

---

## 🚧 Estado Actual

- ✅ Backend service implementado
- ✅ API endpoints creados
- ✅ Base de datos configurada
- ⏳ Smart contracts (pendiente)
- ⏳ Worker service (pendiente)
- ⏳ Frontend UI (pendiente)

---

## 📚 Recursos Adicionales

- [Polygon Docs](https://docs.polygon.technology/)
- [Solana Docs](https://docs.solana.com/)
- [ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [SPL Token Program](https://spl.solana.com/token)

---

**Creado por:** Gailu Labs
**Fecha:** 2025-10-30
**Versión:** 1.0.0
