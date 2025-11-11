# 🛡️ Bridge Security - Admin Guide

## Descripción General

Este documento describe cómo usar los endpoints de administración de seguridad del Bridge para proteger la plataforma contra ataques y vulnerabilidades.

---

## 🔐 Autenticación

Todos los endpoints de administración requieren:
- **Token JWT válido** en el header `Authorization: Bearer <token>`
- **Rol de ADMIN** en la cuenta

---

## 📋 Endpoints Disponibles

### 1. **Estado del Circuit Breaker**

**GET** `/bridge/admin/circuit-breaker/status`

Obtiene el estado actual del circuit breaker (sistema de parada de emergencia).

**Response:**
```json
{
  "open": false,
  "reason": null
}
```

### 2. **Abrir Circuit Breaker (Emergency Stop)**

**POST** `/bridge/admin/circuit-breaker/open`

Detiene TODAS las operaciones del bridge inmediatamente. Usar solo en emergencias.

**Request Body:**
```json
{
  "reason": "Ataque detectado: múltiples intentos de doble gasto"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Circuit breaker opened - all bridge operations stopped",
  "reason": "Ataque detectado: múltiples intentos de doble gasto"
}
```

**Casos de Uso:**
- ✅ Ataque de doble gasto detectado
- ✅ Anomalía masiva en transacciones
- ✅ Vulnerabilidad crítica descubierta
- ✅ Actualización de emergencia del sistema

### 3. **Cerrar Circuit Breaker (Resume)**

**POST** `/bridge/admin/circuit-breaker/close`

Reanuda las operaciones del bridge después de resolver la emergencia.

**Response:**
```json
{
  "success": true,
  "message": "Circuit breaker closed - bridge operations resumed"
}
```

### 4. **Añadir DID a Lista Negra**

**POST** `/bridge/admin/blacklist/did`

Bloquea un DID específico de usar el bridge.

**Request Body:**
```json
{
  "did": "did:gailu:node123:user456",
  "reason": "Múltiples intentos de ataque detectados"
}
```

**Response:**
```json
{
  "success": true,
  "message": "DID did:gailu:node123:user456 added to blacklist",
  "reason": "Múltiples intentos de ataque detectados"
}
```

### 5. **Añadir Dirección a Lista Negra**

**POST** `/bridge/admin/blacklist/address`

Bloquea una dirección de wallet externa de recibir tokens del bridge.

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "reason": "Dirección asociada con actividad fraudulenta"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb added to blacklist",
  "reason": "Dirección asociada con actividad fraudulenta"
}
```

### 6. **Obtener Lista Negra**

**GET** `/bridge/admin/blacklist`

Lista todas las entradas activas en la lista negra.

**Response:**
```json
{
  "success": true,
  "blacklist": {
    "dids": [
      {
        "id": "uuid",
        "type": "DID",
        "value": "did:gailu:node123:user456",
        "reason": "Múltiples intentos de ataque detectados",
        "active": true,
        "addedAt": "2025-01-15T10:30:00Z",
        "addedBy": "admin-user-id"
      }
    ],
    "addresses": [
      {
        "id": "uuid",
        "type": "ADDRESS",
        "value": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
        "reason": "Dirección asociada con actividad fraudulenta",
        "active": true,
        "addedAt": "2025-01-15T11:00:00Z",
        "addedBy": "admin-user-id"
      }
    ],
    "total": 2
  }
}
```

### 7. **Remover de Lista Negra**

**POST** `/bridge/admin/blacklist/:id/remove`

Remueve una entrada de la lista negra.

**Response:**
```json
{
  "success": true,
  "message": "Entry removed from blacklist"
}
```

### 8. **Eventos de Seguridad Recientes**

**GET** `/bridge/admin/security-events`

Lista los últimos 100 eventos de seguridad.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "events": [
    {
      "id": "uuid",
      "type": "RATE_LIMIT_EXCEEDED_1H",
      "severity": "MEDIUM",
      "details": {
        "userDID": "did:gailu:node123:user789",
        "count": 11
      },
      "timestamp": "2025-01-15T12:00:00Z",
      "resolved": false
    },
    {
      "id": "uuid",
      "type": "CONCURRENT_TRANSACTION_ATTEMPT",
      "severity": "HIGH",
      "details": {
        "userDID": "did:gailu:node123:user456",
        "pendingCount": 2
      },
      "timestamp": "2025-01-15T11:45:00Z",
      "resolved": true,
      "resolvedAt": "2025-01-15T11:50:00Z"
    }
  ]
}
```

### 9. **Estadísticas de Seguridad**

**GET** `/bridge/admin/security-stats`

Dashboard con métricas de seguridad.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalEvents": 1523,
    "eventsLast24h": 45,
    "eventsLast1h": 3,
    "criticalEvents": 2,
    "blacklistedDIDs": 5,
    "blacklistedAddresses": 8,
    "circuitBreaker": {
      "open": false,
      "reason": null
    },
    "eventsBySeverity": [
      { "severity": "LOW", "count": 12 },
      { "severity": "MEDIUM", "count": 28 },
      { "severity": "HIGH", "count": 4 },
      { "severity": "CRITICAL", "count": 1 }
    ],
    "topEventTypes": [
      { "type": "RATE_LIMIT_EXCEEDED_1H", "count": 15 },
      { "type": "RAPID_SUCCESSION_ATTEMPT", "count": 10 },
      { "type": "VOLUME_LIMIT_EXCEEDED_24H", "count": 8 }
    ]
  }
}
```

---

## 🚨 Tipos de Eventos de Seguridad

| Tipo de Evento | Severidad | Descripción |
|----------------|-----------|-------------|
| `DOUBLE_SPEND_ATTEMPT` | CRITICAL | Intento de gastar los mismos tokens múltiples veces |
| `BLACKLISTED_DID_ATTEMPT` | CRITICAL | DID bloqueado intentó usar el bridge |
| `CIRCUIT_BREAKER_TRIGGERED` | CRITICAL | Circuit breaker activado |
| `CONCURRENT_TRANSACTION_ATTEMPT` | HIGH | Múltiples transacciones simultáneas del mismo usuario |
| `LARGE_TRANSACTION_ATTEMPT` | HIGH | Transacción excede límite máximo |
| `BLACKLISTED_ADDRESS_ATTEMPT` | HIGH | Dirección bloqueada como destino |
| `RATE_LIMIT_EXCEEDED_1H` | MEDIUM | Más de 10 bridges en 1 hora |
| `RATE_LIMIT_EXCEEDED_24H` | MEDIUM | Más de 50 bridges en 24 horas |
| `VOLUME_LIMIT_EXCEEDED_1H` | MEDIUM | Volumen excede 10,000 SEMILLA/hora |
| `VOLUME_LIMIT_EXCEEDED_24H` | MEDIUM | Volumen excede 100,000 SEMILLA/día |
| `ANOMALOUS_AMOUNT` | MEDIUM | Transacción 5x mayor que el promedio del usuario |
| `RAPID_SUCCESSION_ATTEMPT` | LOW | Bridge antes de 1 minuto desde el último |

---

## 📊 Niveles de Severidad

### 🔴 CRITICAL
- **Acción:** Notificación inmediata al equipo de seguridad
- **Respuesta:** Investigación inmediata
- **Considerar:** Abrir circuit breaker si es masivo

### 🟠 HIGH
- **Acción:** Alerta al equipo de seguridad
- **Respuesta:** Investigar en las próximas horas
- **Considerar:** Añadir a blacklist si es recurrente

### 🟡 MEDIUM
- **Acción:** Log para revisión
- **Respuesta:** Revisión diaria
- **Considerar:** Ajustar límites si es legítimo

### 🟢 LOW
- **Acción:** Log informativo
- **Respuesta:** Revisión semanal
- **Considerar:** Educar al usuario

---

## 🛠️ Procedimientos de Respuesta a Incidentes

### Escenario 1: Ataque de Doble Gasto Detectado

```bash
# 1. Abrir circuit breaker inmediatamente
curl -X POST http://localhost:4000/bridge/admin/circuit-breaker/open \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Double-spend attack detected"}'

# 2. Revisar eventos de seguridad
curl -X GET http://localhost:4000/bridge/admin/security-events \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Añadir DIDs maliciosos a blacklist
curl -X POST http://localhost:4000/bridge/admin/blacklist/did \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"did": "did:gailu:node123:attacker", "reason": "Double-spend attack"}'

# 4. Investigar y corregir vulnerabilidad

# 5. Cerrar circuit breaker cuando sea seguro
curl -X POST http://localhost:4000/bridge/admin/circuit-breaker/close \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Escenario 2: Volumen Anómalo Detectado

```bash
# 1. Revisar estadísticas
curl -X GET http://localhost:4000/bridge/admin/security-stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Revisar eventos recientes
curl -X GET http://localhost:4000/bridge/admin/security-events \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Si es legítimo: no hacer nada
# 4. Si es sospechoso: añadir a blacklist o abrir circuit breaker
```

### Escenario 3: Múltiples Intentos de un Usuario

```bash
# 1. Revisar historial del usuario en eventos
curl -X GET http://localhost:4000/bridge/admin/security-events \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.events[] | select(.details.userDID == "did:gailu:node123:user456")'

# 2. Añadir a blacklist si es recurrente
curl -X POST http://localhost:4000/bridge/admin/blacklist/did \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"did": "did:gailu:node123:user456", "reason": "Repeated suspicious activity"}'
```

---

## 🔍 Monitoreo Recomendado

### Dashboard de Grafana (ejemplo)

```yaml
panels:
  - title: "Security Events Last 24h"
    query: "SELECT COUNT(*) FROM security_events WHERE timestamp > NOW() - INTERVAL 24 HOUR"

  - title: "Critical Events"
    query: "SELECT * FROM security_events WHERE severity = 'CRITICAL' ORDER BY timestamp DESC LIMIT 10"

  - title: "Blacklist Size"
    query: "SELECT type, COUNT(*) FROM blacklist WHERE active = true GROUP BY type"

  - title: "Bridge Volume (Last Hour)"
    query: "SELECT SUM(amount) FROM bridge_transactions WHERE created_at > NOW() - INTERVAL 1 HOUR"
```

### Alertas de PagerDuty

```javascript
// Ejemplo de integración
if (event.severity === 'CRITICAL') {
  pagerduty.trigger({
    routing_key: process.env.PAGERDUTY_KEY,
    event_action: 'trigger',
    payload: {
      summary: `CRITICAL: ${event.type}`,
      severity: 'critical',
      source: 'bridge-security',
      custom_details: event.details,
    },
  });
}
```

---

## ✅ Checklist de Seguridad Diaria

- [ ] Revisar `/bridge/admin/security-stats` para anomalías
- [ ] Verificar que circuit breaker esté cerrado (a menos que sea intencional)
- [ ] Revisar eventos CRITICAL y HIGH del día
- [ ] Confirmar que blacklist no tiene falsos positivos
- [ ] Verificar volumen de bridge vs. promedio histórico

---

## 📚 Referencias

- [BLOCKCHAIN_SECURITY.md](/BLOCKCHAIN_SECURITY.md) - Guía completa de amenazas
- [TOKENOMICS_GUIA.md](/TOKENOMICS_GUIA.md) - Explicación del sistema económico
- [Bridge Service Documentation](/packages/backend/src/federation/bridge.service.ts)
- [Bridge Security Service](/packages/backend/src/federation/bridge-security.service.ts)

---

## 🆘 Contacto de Emergencia

En caso de ataque activo:
1. Abrir circuit breaker inmediatamente
2. Notificar a: security@truk.com
3. Documentar todo en `/bridge/admin/security-events`
4. NO cerrar circuit breaker hasta investigación completa

---

> **Nota:** Este sistema de seguridad es una capa de protección. NO reemplaza:
> - Auditorías profesionales de smart contracts
> - Pruebas de penetración
> - Monitoreo 24/7
> - Plan de respuesta a incidentes completo
