# 🌉 Blockchain Bridges - Sistema Multi-Cadena

Sistema completo de bridges que permite transferir tokens SEMILLA entre la blockchain interna de Comunidad Viva y blockchains externas de bajo costo (Polygon y Solana).

## 🎯 Objetivo

Permitir a los usuarios usar sus tokens SEMILLA en el ecosistema DeFi global, wallets externas (MetaMask, Phantom), exchanges, y otras aplicaciones blockchain, evitando las altas comisiones de Ethereum (~$5-50 por transacción).

## ✨ Características Principales

- ✅ **Multi-Chain**: Soporta Polygon (~$0.001/tx) y Solana (~$0.0002/tx)
- ✅ **Automatizado**: Worker procesa bridges cada 30 segundos
- ✅ **Seguro**: Verificación de transacciones, control de acceso, pausable
- ✅ **Transparente**: Historial completo, enlaces a block explorers
- ✅ **Compatible**: MetaMask, Phantom, WalletConnect
- ✅ **Económico**: Comisión 0.1%, gas pagado por el sistema

## 📊 Comparación de Costos

| Blockchain | Costo por TX | Wallet Compatible | Status |
|------------|-------------|-------------------|--------|
| Ethereum L1 | $5-50 | MetaMask | ❌ Muy caro |
| **Polygon** | **$0.001** | **MetaMask** | ✅ **Implementado** |
| **Solana** | **$0.0002** | **Phantom** | ✅ **Implementado** |
| Arbitrum | $0.01 | MetaMask | 🔜 Planeado |
| Optimism | $0.01 | MetaMask | 🔜 Planeado |

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Comunidad Viva                           │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   Frontend   │◄────────┤   Backend    │                │
│  │  /bridge UI  │         │ Bridge API   │                │
│  └──────────────┘         └──────┬───────┘                │
│                                   │                         │
│                          ┌────────▼────────┐               │
│                          │  Bridge Worker  │               │
│                          │  (Cron 30s)     │               │
│                          └────────┬────────┘               │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
      ┌─────────────────┐ ┌─────────────────┐ ┌──────────┐
      │  Polygon PoS    │ │  Solana         │ │  Future  │
      │  wSEMILLA       │ │  wSEMILLA       │ │  Chains  │
      │  (ERC-20)       │ │  (SPL Token)    │ │  ...     │
      └─────────────────┘ └─────────────────┘ └──────────┘
```

## 🔄 Flujo de Uso

### Lock (Comunidad Viva → External Chain)

```
Usuario en Comunidad Viva
         │
         ▼
[Conectar MetaMask/Phantom]
         │
         ▼
[Seleccionar cantidad: 100 SEMILLA]
         │
         ▼
[Sistema bloquea 100 SEMILLA + 0.1 fee]
         │
         ▼
[Worker detecta bridge PENDING]
         │
         ▼
[Worker mintea 100 wSEMILLA en chain externa]
         │
         ▼
[Usuario recibe tokens en MetaMask/Phantom]
         │
         ▼
[Puede usar en DeFi, exchanges, etc.]
```

**Tiempo total**: 30-60 segundos
**Costo**: 0.1 SEMILLA + ~$0.001 gas (pagado por sistema)

### Unlock (External Chain → Comunidad Viva)

```
Usuario en MetaMask/Phantom
         │
         ▼
[Quemar 100 wSEMILLA en chain externa]
         │
         ▼
[Copiar transaction hash]
         │
         ▼
[Pegar hash en /bridge en Comunidad Viva]
         │
         ▼
[Sistema verifica burn en blockchain]
         │
         ▼
[Worker desbloquea 99.9 SEMILLA (100 - 0.1% fee)]
         │
         ▼
[Usuario recibe SEMILLA en balance interno]
```

**Tiempo total**: 1-2 minutos
**Costo**: 0.1 SEMILLA + ~$0.001 gas (pagado por usuario)

## 📁 Estructura del Proyecto

```
comunidad-viva/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   └── federation/
│   │   │       ├── bridge.service.ts           # Lógica de negocio
│   │   │       ├── bridge.controller.ts        # API REST
│   │   │       ├── bridge-worker.service.ts    # Worker automático
│   │   │       ├── polygon-contract.service.ts # Integración Polygon
│   │   │       ├── solana-contract.service.ts  # Integración Solana
│   │   │       └── federation.module.ts        # Módulo NestJS
│   │   ├── contracts/
│   │   │   └── polygon/
│   │   │       ├── WrappedSEMILLA.sol         # Smart contract ERC-20
│   │   │       ├── hardhat.config.js          # Configuración Hardhat
│   │   │       └── deploy.js                  # Script de deployment
│   │   ├── prisma/
│   │   │   └── schema.prisma                  # Modelo BridgeTransaction
│   │   ├── test-bridge.sh                     # Script de testing
│   │   └── .env.example                       # Variables de entorno
│   └── web/
│       └── src/
│           ├── pages/
│           │   └── bridge.tsx                 # UI del bridge
│           └── components/
│               └── Navbar.tsx                 # Navegación (actualizada)
├── BRIDGE_SUMMARY.md                          # Resumen ejecutivo
├── BRIDGE_QUICK_START.md                      # Guía rápida
├── BLOCKCHAIN_BRIDGE_GUIDE.md                 # Guía conceptual
├── BRIDGE_DEPLOYMENT_GUIDE.md                 # Guía de deployment
└── BRIDGE_README.md                           # Este archivo
```

## 🚀 Quick Start

### 1. Acceso al Sistema

**URL**: http://localhost:3000/bridge

**Desde el menú**:
1. Click en "🚀 Plataforma"
2. Sección "💰 ECONOMÍA"
3. Click en "🌉 Blockchain Bridges"

### 2. Requisitos Básicos

- ✅ Cuenta en Comunidad Viva
- ✅ SEMILLA tokens en balance (mínimo 10 para Polygon, 1 para Solana)
- ✅ Wallet externa instalada (MetaMask o Phantom)

### 3. Testing Rápido

```bash
cd packages/backend
./test-bridge.sh
```

Esto verificará:
- ✅ Backend funcionando
- ✅ Endpoints de bridge disponibles
- ✅ Worker inicializado
- ✅ Stats y chains configuradas

### 4. Para Desarrollo

#### Backend
```bash
cd packages/backend
npm install
npm run dev
```

Endpoints disponibles:
- `POST /bridge/lock` - Iniciar bridge
- `POST /bridge/unlock` - Recuperar tokens
- `GET /bridge/history` - Ver historial
- `GET /bridge/stats` - Estadísticas
- `GET /bridge/chains` - Chains soportadas
- `GET /bridge/transaction/:id` - Ver transacción

#### Frontend
```bash
cd packages/web
npm install
npm run dev
```

Acceder a: http://localhost:3000/bridge

## ⚙️ Configuración

### Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
# Polygon
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
POLYGON_SEMILLA_CONTRACT=0x... # Después de deployment
POLYGON_BRIDGE_PRIVATE_KEY=0x... # Wallet del operador

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_SEMILLA_MINT=... # Después de crear mint
SOLANA_AUTHORITY_PRIVATE_KEY=[1,2,3,...] # Array de bytes

# Bridge
BRIDGE_FEE_PERCENTAGE=0.1
```

### Deployment del Smart Contract

```bash
cd packages/backend/contracts/polygon
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

Ver [BRIDGE_DEPLOYMENT_GUIDE.md](./BRIDGE_DEPLOYMENT_GUIDE.md) para más detalles.

## 📖 Documentación

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [BRIDGE_README.md](./BRIDGE_README.md) | Overview general del sistema | Todos |
| [BRIDGE_QUICK_START.md](./BRIDGE_QUICK_START.md) | Guía práctica paso a paso | Usuarios y Devs |
| [BRIDGE_SUMMARY.md](./BRIDGE_SUMMARY.md) | Resumen ejecutivo técnico | Technical Leaders |
| [BLOCKCHAIN_BRIDGE_GUIDE.md](./BLOCKCHAIN_BRIDGE_GUIDE.md) | Conceptos y arquitectura | Developers |
| [BRIDGE_DEPLOYMENT_GUIDE.md](./BRIDGE_DEPLOYMENT_GUIDE.md) | Deployment en producción | DevOps |

## 🧪 Testing

### Test Básico
```bash
./test-bridge.sh
```

### Test con Autenticación
```bash
export TEST_EMAIL='test@example.com'
export TEST_PASSWORD='password'
./test-bridge.sh
```

### Test de Bridge Real
```bash
export RUN_BRIDGE_TEST=true
export TEST_EXTERNAL_ADDRESS='0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
./test-bridge.sh
```

### Test Manual con cURL

**Get chains**:
```bash
curl http://localhost:4000/bridge/chains | jq
```

**Get stats**:
```bash
curl http://localhost:4000/bridge/stats | jq
```

**Lock SEMILLA**:
```bash
curl -X POST http://localhost:4000/bridge/lock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "targetChain": "POLYGON",
    "externalAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }' | jq
```

## 📊 API Reference

### POST /bridge/lock
Bloquea SEMILLA y crea solicitud de mint en chain externa.

**Request**:
```json
{
  "amount": 100,
  "targetChain": "POLYGON",
  "externalAddress": "0x..."
}
```

**Response**:
```json
{
  "id": "abc-123",
  "status": "PENDING",
  "amount": 100,
  "fee": 0.1,
  "direction": "LOCK",
  "targetChain": "POLYGON",
  "externalAddress": "0x...",
  "createdAt": "2025-10-30T20:00:00.000Z"
}
```

### POST /bridge/unlock
Verifica burn y desbloquea SEMILLA.

**Request**:
```json
{
  "amount": 100,
  "sourceChain": "POLYGON",
  "externalTxHash": "0xabc..."
}
```

### GET /bridge/history
Lista bridges del usuario autenticado.

**Query params**:
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)

### GET /bridge/stats
Estadísticas globales del sistema.

**Response**:
```json
{
  "totalBridged": 1000000,
  "totalLocked": 500000,
  "totalUnlocked": 500000,
  "byChain": [
    {
      "chain": "POLYGON",
      "totalAmount": 750000,
      "bridgeCount": 1500
    },
    {
      "chain": "SOLANA",
      "totalAmount": 250000,
      "bridgeCount": 500
    }
  ]
}
```

### GET /bridge/chains
Chains soportadas y sus configuraciones.

**Response**:
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

## 🔒 Seguridad

### Medidas Implementadas

1. **Control de Acceso**:
   - JWT authentication en todos los endpoints protegidos
   - Solo BRIDGE_ROLE puede mintear en smart contracts
   - Ownership validation en unlocks

2. **Validación de Transacciones**:
   - Verificación de burn antes de unlock
   - Verificación de cantidades exactas
   - Prevención de double-spending
   - Check de confirmaciones en blockchain

3. **Smart Contract**:
   - Pausable en caso de emergencia
   - Role-based access control (RBAC)
   - Events para auditoría
   - Burnable tokens

4. **Rate Limiting**:
   - Worker procesa máximo 10 bridges a la vez
   - Prevención de congestión

### Recomendaciones para Producción

- [ ] Usar multisig wallet para bridge operator
- [ ] Auditoría de seguridad del smart contract
- [ ] Monitoring 24/7 del worker
- [ ] Backup automático de private keys en vault
- [ ] Alertas para bridges FAILED
- [ ] Rate limiting adicional en API

## 📈 Monitoreo

### Worker Status
```bash
curl http://localhost:4000/bridge/worker/status | jq
```

**Response**:
```json
{
  "isProcessing": false,
  "pendingLocks": 3,
  "pendingUnlocks": 1,
  "failedBridges": 0,
  "polygon": {
    "connected": true,
    "chainId": 80001,
    "blockNumber": 45678901,
    "gasPrice": "1.5 gwei"
  }
}
```

### Métricas Clave

- **Pending Locks**: Bridges esperando mint
- **Pending Unlocks**: Bridges esperando verificación
- **Failed Bridges**: Bridges con error (requieren atención)
- **Gas Price**: Costo actual de gas
- **Processing Time**: Tiempo promedio de procesamiento

## 🐛 Troubleshooting

### Bridge se queda en PENDING
1. Verificar worker status: `GET /bridge/worker/status`
2. Revisar logs del backend
3. Verificar RPC URLs en .env
4. Verificar balance de gas del operador

### Bridge marca FAILED
1. Revisar error en transacción
2. Verificar configuración de contract address
3. Intentar retry: `POST /bridge/retry/:id`

### Tokens no aparecen en MetaMask
1. Agregar token custom con contract address
2. Verificar red (Mumbai testnet)
3. Esperar 2-3 minutos adicionales
4. Verificar en Polygonscan

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Smart Contracts | Solidity + Hardhat |
| Polygon Integration | ethers.js v6 |
| Solana Integration | @solana/web3.js |
| Frontend | Next.js + React |
| Wallet Integration | MetaMask SDK, Phantom |
| Worker | @nestjs/schedule (Cron) |
| Testing | Bash scripts + cURL |

## 🗺️ Roadmap

### ✅ Fase 1: MVP (Completado)
- [x] Backend API completo
- [x] Smart contract ERC-20
- [x] Worker automático
- [x] UI básica
- [x] Soporte Polygon
- [x] Soporte Solana
- [x] Documentación completa

### 🔜 Fase 2: Testnet (Próximo)
- [ ] Deploy a Mumbai testnet
- [ ] Testing con usuarios beta
- [ ] Optimización de gas
- [ ] Dashboard de monitoreo

### 🔜 Fase 3: Mainnet (Futuro)
- [ ] Auditoría de seguridad
- [ ] Deploy a Polygon mainnet
- [ ] Deploy a Solana mainnet
- [ ] Pools de liquidez en DEXs

### 🔜 Fase 4: Expansión (Futuro)
- [ ] Arbitrum support
- [ ] Optimism support
- [ ] BSC support
- [ ] Cross-chain swaps

## 🤝 Contribuir

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📝 Licencia

Ver [LICENSE](../LICENSE)

## 📞 Soporte

- **Documentación**: Ver archivos BRIDGE_*.md
- **Issues**: GitHub Issues
- **Testing**: `./test-bridge.sh`
- **Logs**: `packages/backend/logs/`

## 🎉 Créditos

Desarrollado para Comunidad Viva como parte del ecosistema Gailu Labs.

**Chains Soportadas**:
- 🟣 Polygon (Mumbai testnet / PoS mainnet)
- 🟢 Solana (Devnet / Mainnet Beta)

---

**Status**: ✅ Implementado y funcionando
**Última actualización**: 2025-10-30
**Versión**: 1.0.0
