# 🛡️ Guía de Seguridad: Blockchain y Tokenomics

## 📋 Índice

1. [Amenazas Identificadas](#amenazas-identificadas)
2. [Vulnerabilidades Actuales](#vulnerabilidades-actuales)
3. [Mitigaciones Implementadas](#mitigaciones-implementadas)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Monitoreo y Respuesta](#monitoreo-y-respuesta)
6. [Checklist de Seguridad](#checklist-de-seguridad)

---

## 🚨 Amenazas Identificadas

### 1. **Ataques de Doble Gasto (Double Spending)**

**Descripción:** Intentar gastar los mismos tokens múltiples veces.

**Vectores de Ataque:**
```typescript
// Ataque: Usuario inicia múltiples bridges simultáneos
POST /bridge/lock { amount: 1000 }  // Request 1
POST /bridge/lock { amount: 1000 }  // Request 2 (mismo balance)
POST /bridge/lock { amount: 1000 }  // Request 3 (mismo balance)
```

**Impacto:** 🔴 CRÍTICO
- Creación de tokens falsos
- Inflación no controlada
- Pérdida de confianza en el sistema

**Mitigación:**
- ✅ Transacciones atómicas con Prisma
- ✅ Locks pesimistas en base de datos
- ✅ Nonces únicos por transacción
- ✅ Verificación de balance ANTES y DESPUÉS

### 2. **Ataques de Front-Running**

**Descripción:** Observar transacciones pendientes y ejecutar la propia primero.

**Vectores de Ataque:**
```typescript
// Atacante ve en mempool:
User A: bridge 1000 SEMILLA → Polygon

// Atacante ejecuta:
Attacker: bridge 10000 SEMILLA → Polygon (gas alto)
// Su tx se procesa primero, afectando precios
```

**Impacto:** 🟠 ALTO
- Manipulación de precios
- MEV (Maximal Extractable Value)
- Pérdidas para usuarios honestos

**Mitigación:**
- ✅ Commit-reveal scheme
- ✅ Time-locks configurables
- ✅ Límites de slippage
- ✅ Private mempools (Flashbots)

### 3. **Ataques de Replay**

**Descripción:** Reutilizar transacciones firmadas en contextos diferentes.

**Vectores de Ataque:**
```typescript
// Transacción original en Polygon testnet:
signature = sign({
  from: "0xUser",
  to: "0xContract",
  amount: 1000,
  nonce: 1
})

// Atacante replica en mainnet con misma firma
```

**Impacto:** 🔴 CRÍTICO
- Robo de fondos
- Transacciones no autorizadas
- Pérdida total de activos

**Mitigación:**
- ✅ Chain ID en firmas
- ✅ Nonces únicos por red
- ✅ Domain separators (EIP-712)
- ✅ Timestamps de expiración

### 4. **Ataques de Reentrancy**

**Descripción:** Llamar recursivamente a una función antes de que complete.

**Vectores de Ataque:**
```solidity
// Contrato vulnerable:
function unlock(uint amount) external {
    require(balances[msg.sender] >= amount);

    // 🚨 VULNERABLE: external call antes de update
    msg.sender.call{value: amount}("");

    balances[msg.sender] -= amount; // Ya es tarde
}
```

**Impacto:** 🔴 CRÍTICO
- Drain completo de contratos
- Pérdida masiva de fondos
- Colapso del sistema

**Mitigación:**
- ✅ Checks-Effects-Interactions pattern
- ✅ ReentrancyGuard de OpenZeppelin
- ✅ Estado actualizado ANTES de external calls
- ✅ Mutex locks

### 5. **Ataques de Overflow/Underflow**

**Descripción:** Manipular operaciones aritméticas para generar valores incorrectos.

**Vectores de Ataque:**
```solidity
// Sin SafeMath:
uint256 balance = 1;
balance -= 2; // Underflow → balance = 2^256 - 1 (HUGE)
```

**Impacto:** 🔴 CRÍTICO
- Creación ilimitada de tokens
- Balances falsos
- Quiebra del sistema económico

**Mitigación:**
- ✅ Solidity 0.8+ (overflow protection built-in)
- ✅ SafeMath library
- ✅ Validaciones explícitas
- ✅ Límites máximos configurables

### 6. **Ataques de Phishing / Social Engineering**

**Descripción:** Engañar usuarios para obtener claves privadas.

**Vectores de Ataque:**
```
Atacante: "Conecta tu wallet a nuestro_fake_truk.com"
Usuario: *firma transacción maliciosa*
Resultado: Tokens robados
```

**Impacto:** 🟠 ALTO
- Robo individual de fondos
- Pérdida de reputación
- Usuarios vulnerables afectados

**Mitigación:**
- ✅ Educación de usuarios
- ✅ Verificación de dominios
- ✅ Warnings en transacciones
- ✅ Hardware wallet support

### 7. **Ataques 51% / Consensus Manipulation**

**Descripción:** Controlar mayoría de poder de validación.

**Vectores de Ataque:**
```
En Proof-of-Help personalizado:
Atacante: Genera ayuda falsa masivamente
Resultado: Controla governance
```

**Impacto:** 🟡 MEDIO (depende de distribución)
- Manipulación de governance
- Aprobación de propuestas maliciosas
- Centralización del poder

**Mitigación:**
- ✅ Sybil resistance mechanisms
- ✅ Delegación líquida
- ✅ Cooldowns entre acciones
- ✅ Límites de votación por identidad

### 8. **Ataques de Drenaje de Gas (Gas Griefing)**

**Descripción:** Forzar transacciones costosas que fallen.

**Vectores de Ataque:**
```solidity
// Atacante envía tx con datos maliciosos
function process(bytes[] calldata data) external {
    for(uint i = 0; i < data.length; i++) {
        // Loop infinito si data.length es enorme
    }
}
```

**Impacto:** 🟡 MEDIO
- Pérdida de gas fees
- DoS temporal del servicio
- Frustración de usuarios

**Mitigación:**
- ✅ Límites en tamaños de arrays
- ✅ Gas limits configurables
- ✅ Rate limiting
- ✅ Estimación previa de gas

### 9. **Ataques de Timestamp Manipulation**

**Descripción:** Manipular timestamps de bloques para ventaja.

**Vectores de Ataque:**
```solidity
// Vulnerable:
require(block.timestamp > unlockTime);
// Minero manipula timestamp ±15 segundos
```

**Impacto:** 🟡 MEDIO
- Unlock prematuro de fondos
- Gaming de time-locks
- Manipulación de subastas

**Mitigación:**
- ✅ No usar block.timestamp para lógica crítica
- ✅ Block numbers en lugar de timestamps
- ✅ Tolerancia de ±15 segundos asumida
- ✅ Oráculos externos para tiempo

### 10. **Ataques de Denial of Service (DoS)**

**Descripción:** Saturar el sistema para negarlo a usuarios legítimos.

**Vectores de Ataque:**
```typescript
// Spam masivo:
for(let i = 0; i < 10000; i++) {
  await POST('/bridge/lock', { amount: 0.01 });
}
```

**Impacto:** 🟠 ALTO
- Sistema inaccesible
- Pérdida de oportunidades
- Frustración masiva

**Mitigación:**
- ✅ Rate limiting agresivo
- ✅ CAPTCHA en endpoints críticos
- ✅ Minimum amounts
- ✅ Throttling por IP/usuario
- ✅ CloudFlare / DDoS protection

---

## 🔍 Vulnerabilidades Actuales

### CRÍTICAS 🔴

#### 1. **Falta de Validación de Input en Bridge**

**Archivo:** `federation/bridge.service.ts`

**Problema:**
```typescript
async lockAndBridge(
  userDID: string,
  amount: number,  // ❌ Sin validación de tipo
  targetChain: BridgeChain,
  externalAddress: string,  // ❌ Sin validación de formato
)
```

**Exploit:**
```typescript
// Atacante envía:
lockAndBridge(
  "did:gailu:malicious",
  -1000,  // ❌ Número negativo!
  "FAKE_CHAIN",
  "'; DROP TABLE users; --"  // SQL injection attempt
)
```

**Fix Requerido:**
```typescript
// Validar con class-validator
import { IsPositive, IsEthereumAddress, IsEnum } from 'class-validator';

class LockBridgeDto {
  @IsString()
  @Matches(/^did:gailu:[a-zA-Z0-9-]+$/)
  userDID: string;

  @IsPositive()
  @Min(0.01)
  @Max(1000000)
  amount: number;

  @IsEnum(BridgeChain)
  targetChain: BridgeChain;

  @IsEthereumAddress() // o IsBase58 para Solana
  externalAddress: string;
}
```

#### 2. **Race Condition en Locks**

**Archivo:** `federation/bridge.service.ts:131`

**Problema:**
```typescript
const bridgeTx = await this.prisma.$transaction(async (tx) => {
  // Tiempo entre check y update = RACE WINDOW
  await tx.user.update({
    where: { id: userId },
    data: { semillaBalance: { decrement: totalAmount } },
  });
});
```

**Exploit:**
```bash
# Terminal 1:
curl -X POST /bridge/lock -d '{"amount": 1000}'

# Terminal 2 (simultáneamente):
curl -X POST /bridge/lock -d '{"amount": 1000}'

# Ambos pasan el check, ambos decrementan!
```

**Fix Requerido:**
```typescript
// Usar SELECT FOR UPDATE
const user = await tx.user.findUnique({
  where: { id: userId },
  select: { semillaBalance: true }
});

// Explicit lock
const locked = await tx.$executeRaw`
  UPDATE users
  SET semilla_balance = semilla_balance - ${totalAmount}
  WHERE id = ${userId} AND semilla_balance >= ${totalAmount}
  RETURNING *
`;

if (locked.length === 0) {
  throw new BadRequestException('Insufficient balance or concurrent tx');
}
```

#### 3. **Private Keys en Variables de Entorno**

**Archivo:** `.env.example:47`

**Problema:**
```bash
BRIDGE_WALLET_PRIVATE_KEY=your-wallet-private-key
```

**Exploit:**
- Acceso al servidor → robo de private key
- Logs accidentales de env vars
- Backups sin cifrar

**Fix Requerido:**
```typescript
// Usar KMS (AWS, GCP, Azure)
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

async function getPrivateKey(): Promise<string> {
  const kms = new KMSClient({ region: 'us-east-1' });

  const encrypted = process.env.ENCRYPTED_BRIDGE_KEY;

  const { Plaintext } = await kms.send(new DecryptCommand({
    CiphertextBlob: Buffer.from(encrypted, 'base64'),
    KeyId: process.env.KMS_KEY_ID,
  }));

  return Buffer.from(Plaintext).toString('utf-8');
}

// O Hardware Security Module (HSM)
// O Multi-sig wallet (mejor opción)
```

### ALTAS 🟠

#### 4. **Falta de Rate Limiting Específico**

**Archivo:** `app.module.ts`

**Problema:**
```typescript
ThrottlerModule.forRoot({
  throttlers: [{
    name: 'default',
    ttl: 60000,
    limit: 100,  // ❌ 100 req/min es MUCHO para bridge
  }]
})
```

**Fix Requerido:**
```typescript
// Rate limiting diferenciado:
{
  name: 'bridge',
  ttl: 3600000,  // 1 hora
  limit: 10,      // Máximo 10 bridges por hora
}

// Aplicar en controller:
@Throttle({ bridge: { ttl: 3600000, limit: 10 } })
@Post('lock')
async lockAndBridge() { }
```

#### 5. **Sin Logging de Transacciones Sospechosas**

**Problema:** No hay auditoría de actividad sospechosa.

**Fix Requerido:**
```typescript
// Logger centralizado
import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityLogger {
  async logSuspiciousActivity(event: {
    type: 'DOUBLE_SPEND_ATTEMPT' | 'RAPID_BRIDGES' | 'UNUSUAL_AMOUNT';
    userId: string;
    details: any;
  }) {
    await this.prisma.securityEvent.create({
      data: {
        ...event,
        severity: 'HIGH',
        timestamp: new Date(),
      }
    });

    // Alertar equipo
    if (event.type === 'DOUBLE_SPEND_ATTEMPT') {
      await this.notifySecurityTeam(event);
    }
  }
}
```

---

## ✅ Mitigaciones Implementadas

Voy a crear un nuevo servicio de seguridad que implemente todas estas protecciones.

---

## 📝 Mejores Prácticas

### Para Desarrollo:

1. **Nunca confíes en el input del usuario**
   ```typescript
   // ❌ MAL
   const amount = req.body.amount;

   // ✅ BIEN
   const amount = parseFloat(req.body.amount);
   if (isNaN(amount) || amount <= 0 || amount > MAX_BRIDGE_AMOUNT) {
     throw new BadRequestException('Invalid amount');
   }
   ```

2. **Usa transacciones atómicas**
   ```typescript
   // ✅ Todo o nada
   await prisma.$transaction([
     prisma.user.update({ ... }),
     prisma.semillaTransaction.create({ ... }),
     prisma.bridgeTransaction.create({ ... }),
   ]);
   ```

3. **Implementa circuit breakers**
   ```typescript
   if (await this.detectAnomalousActivity()) {
     await this.pauseBridge();
     await this.notifyAdmin();
   }
   ```

### Para Smart Contracts:

1. **Checks-Effects-Interactions**
   ```solidity
   function withdraw(uint amount) external {
     // 1. CHECKS
     require(balances[msg.sender] >= amount);

     // 2. EFFECTS
     balances[msg.sender] -= amount;

     // 3. INTERACTIONS
     (bool success,) = msg.sender.call{value: amount}("");
     require(success);
   }
   ```

2. **Use OpenZeppelin**
   ```solidity
   import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
   import "@openzeppelin/contracts/security/Pausable.sol";

   contract WrappedSEMILLA is ReentrancyGuard, Pausable {
     function bridgeMint(address to, uint amount)
       external
       nonReentrant
       whenNotPaused
     { }
   }
   ```

3. **Audita TODO**
   - CertiK
   - Trail of Bits
   - ConsenSys Diligence
   - OpenZeppelin Defender

---

## 🔔 Monitoreo y Respuesta

### Métricas a Monitorear:

```typescript
interface SecurityMetrics {
  // Transacciones
  bridgeVolumeLast1h: number;
  bridgeVolumeLast24h: number;
  averageTransactionSize: number;

  // Anomalías
  failedTransactionsRate: number;
  duplicateTransactionAttempts: number;
  suspiciousAddresses: string[];

  // Performance
  averageProcessingTime: number;
  queueLength: number;
  workerHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}
```

### Alertas Automáticas:

```typescript
// Condiciones de alerta
const ALERT_CONDITIONS = {
  VOLUME_SPIKE: bridgeVolumeLast1h > average * 5,
  HIGH_FAILURE_RATE: failedRate > 0.1, // 10%
  LARGE_TRANSACTION: amount > 100000,
  RAPID_SUCCESSION: transactions > 5 in 60 seconds,
};
```

---

## ✅ Checklist de Seguridad

### Antes de Deploy a Producción:

- [ ] Auditoría de smart contracts profesional
- [ ] Tests de penetración (pen testing)
- [ ] Rate limiting configurado
- [ ] Monitoring y alertas activos
- [ ] Private keys en KMS/HSM
- [ ] Multi-sig wallet para fondos críticos
- [ ] Circuit breakers implementados
- [ ] Documentación de respuesta a incidentes
- [ ] Bug bounty program activo
- [ ] Insurance contra hacks (Nexus Mutual)

### Deploy Incremental:

1. **Fase 1: Testnet** (1 mes)
   - Deploy en Mumbai (Polygon) y Devnet (Solana)
   - Usuarios beta limitados
   - Límites bajos (max 100 SEMILLA)

2. **Fase 2: Mainnet Limitado** (2 meses)
   - Deploy en mainnet
   - Límite: 10,000 SEMILLA por transacción
   - Whitelist de usuarios iniciales

3. **Fase 3: Producción Completa**
   - Límites aumentados gradualmente
   - Monitoreo 24/7
   - Equipo de respuesta ready

---

## 🚀 Implementación

Voy a crear ahora los servicios y DTOs necesarios para asegurar el sistema.

