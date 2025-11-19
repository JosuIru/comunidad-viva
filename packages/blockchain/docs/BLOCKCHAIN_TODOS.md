# Blockchain - Tareas Pendientes

## Estado Actual: Beta Testing en Amoy Testnet

---

## 1. PARCIALMENTE IMPLEMENTADO

### 1.1 Solana - Implementación SPL Token

**Archivo:** `/packages/backend/src/federation/solana-contract.service.ts`

**Estado:** Código simulado - retorna firmas falsas

**Tareas:**
- [ ] Instalar y configurar `@solana/spl-token` correctamente
- [ ] Implementar `mintTokens()` real (línea ~164 retorna firma simulada)
- [ ] Implementar `verifyBurnTransaction()` real (líneas 208-213 simuladas)
- [ ] Crear cuenta de token SPL para SEMILLA en Solana
- [ ] Configurar autoridad de mint en Solana
- [ ] Tests de integración con devnet

**Código actual (simulado):**
```typescript
// Línea 164 aproximadamente
return 'simulated_solana_signature_' + Date.now();
```

**Prioridad:** Media - No bloquea beta testing

---

### 1.2 Bridge Reverso - Unlock después de Burn

**Archivo:** `/packages/backend/src/federation/blockchain.service.ts`

**Estado:** TODO en línea ~250

**Tareas:**
- [ ] Implementar lógica de verificación de burn en cadena externa
- [ ] Llamar a `unlock()` en contrato SEMILLA después de verificar burn
- [ ] Manejar casos de error y reintentos
- [ ] Actualizar estado de transacción en base de datos
- [ ] Emitir eventos de unlock completado

**Código actual:**
```typescript
// Línea ~250
// TODO: Implement reverse bridge logic
this.logger.warn('Reverse bridge logic not yet implemented');
```

**Prioridad:** Alta - Necesario para flujo completo de bridge

---

### 1.3 DID Remoto - Resolución Externa

**Archivo:** `/packages/backend/src/federation/did.service.ts`

**Estado:** Solo resolución local implementada

**Tareas:**
- [ ] Implementar resolución de DIDs remotos (otros nodos de federación)
- [ ] Cachear DIDs remotos resueltos
- [ ] Validar firmas de DIDs externos
- [ ] Manejar timeout y errores de red
- [ ] Implementar refresh de DIDs cacheados

**Código actual:**
```typescript
// Solo resuelve did:gailu:local:*
// TODO: Remote DID resolution not yet implemented
```

**Prioridad:** Media - Necesario para federación entre nodos

---

### 1.4 ActivityPub - Federación Completa

**Archivo:** `/packages/backend/src/federation/activitypub.service.ts`

**Estado:** Múltiples TODOs

**Tareas:**
- [ ] Generación de claves públicas/privadas para actores
- [ ] Firmar actividades salientes (HTTP Signatures)
- [ ] Validar firmas de actividades entrantes
- [ ] Push de actividades a nodos remotos
- [ ] Inbox/Outbox completo
- [ ] Manejo de Follow/Accept/Reject

**TODOs en código:**
```typescript
// TODO: Public key generation
// TODO: Push activity to remote nodes
// TODO: Activity signature validation
```

**Prioridad:** Baja - Funcionalidad avanzada de federación

---

### 1.5 Alertas de Emergencia

**Archivos:**
- `/packages/backend/src/federation/blockchain.service.ts` (línea ~292)
- `/packages/backend/src/federation/bridge-security.service.ts`

**Estado:** TODO - No hay notificaciones

**Tareas:**
- [ ] Integrar servicio de notificaciones (email, Telegram, Discord)
- [ ] Alertar en eventos EmergencyPause
- [ ] Alertar en eventos EmergencyUnpause
- [ ] Alertar en transacciones de bridge sospechosas
- [ ] Dashboard de monitoreo de eventos de seguridad

**Código actual:**
```typescript
// TODO: Send alert notification
this.logger.error('EMERGENCY: Contract paused!');
```

**Prioridad:** Alta para producción - No bloquea beta

---

## 2. NO DESPLEGADO

### 2.1 Polygon Mainnet - WrappedSEMILLA

**Archivo:** `/packages/backend/contracts/polygon/WrappedSEMILLA.sol`

**Estado:** Contrato listo, no desplegado

**Tareas:**
- [ ] Auditoría final del contrato
- [ ] Configurar wallet de deployment con MATIC
- [ ] Desplegar en Polygon mainnet
- [ ] Verificar contrato en Polygonscan
- [ ] Configurar operadores de bridge
- [ ] Actualizar variables de entorno con dirección

**Requisitos previos:**
- Beta testing completado en Amoy
- Gnosis Safe configurado
- Fondos MATIC para gas

**Prioridad:** Alta después de beta

---

### 2.2 Gnosis Safe - Multi-sig

**Documentación:** `/packages/blockchain/docs/GNOSIS_SAFE_SETUP.md`

**Estado:** Guía preparada, no configurado

**Tareas:**
- [ ] Crear Gnosis Safe en Polygon
- [ ] Agregar owners (mínimo 3 recomendado)
- [ ] Configurar threshold (2/3 o 3/5)
- [ ] Transferir ownership de SemillaToken al Safe
- [ ] Transferir PAUSER_ROLE al Safe
- [ ] Documentar proceso de propuestas

**Prioridad:** Alta para mainnet - Crítico para seguridad

---

## 3. MEJORAS FUTURAS

### 3.1 Monitoreo y Analytics
- [ ] Dashboard de métricas on-chain
- [ ] Alertas de volumen inusual
- [ ] Tracking de gas costs
- [ ] Reportes de transacciones

### 3.2 Optimizaciones
- [ ] Gas optimization en contratos
- [ ] Batch transactions para bridges
- [ ] Layer 2 adicionales (Arbitrum, Optimism)

### 3.3 Seguridad Avanzada
- [ ] Rate limiting on-chain
- [ ] Whitelist/blacklist de direcciones
- [ ] Timelock para operaciones críticas
- [ ] Bug bounty program

---

## Orden de Prioridad Recomendado

1. **Bridge Reverso** - Completa el flujo básico
2. **Alertas de Emergencia** - Seguridad operativa
3. **Gnosis Safe** - Preparación para mainnet
4. **Polygon Mainnet Deploy** - Expansión
5. **DID Remoto** - Federación básica
6. **Solana** - Multi-chain completo
7. **ActivityPub** - Federación avanzada

---

## Contacto

Para preguntas sobre implementación:
- Smart Contracts: Ver `/packages/blockchain/README.md`
- Backend Services: Ver `/packages/backend/src/federation/`
- Security: Ver `/packages/blockchain/docs/SECURITY_STRATEGY_AMOY.md`

---

*Última actualización: 2025-11-19*
