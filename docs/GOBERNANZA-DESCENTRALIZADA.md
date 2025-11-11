# Gobernanza Descentralizada - Truk

## Filosofía: Sin Jerarquías, Sin Policías

Este sistema elimina completamente las estructuras de poder tradicionales y las reemplaza con **consenso comunitario** e **incentivos al bien común**.

## Principios Fundamentales

### 1. **Reputación = Ayuda Real (Proof of Help)**

La única forma de ganar poder de decisión es **ayudando genuinamente** a la comunidad:

- **generosityScore**: Mide cuánto das sin esperar nada a cambio
  - Compartir tiempo en el banco de tiempo
  - Donar a pools comunitarios
  - Ayudar en emergencias
  - Organizar eventos comunitarios

- **flowPower**: Poder de voto basado en tu generosidad
  - No es dinero = poder
  - Es ayuda = poder
  - Los trolls tienen 0 reputación = 0 voto

### 2. **Votación Cuadrática (Anti-Plutocracia)**

Evita que los "ricos" (en créditos o reputación) dominen:

```
1 crédito = 1 voto
4 créditos = 2 votos  (no 4)
9 créditos = 3 votos  (no 9)
100 créditos = 10 votos (no 100)
```

**Resultado**: Favorece consenso amplio sobre minorías poderosas

### 3. **Sin Roles Permanentes**

#### ❌ NO HAY:
- Administradores
- Moderadores
- Owners
- Jerarquías

#### ✅ SÍ HAY:
- **Fundadores iniciales**: Solo durante 30 días de bootstrap
- **Permisos basados en reputación**: Cualquiera puede ganarlos ayudando

## Cómo Funciona

### Niveles de Participación (basados en reputación)

```typescript
// Votar en decisiones
minVoteReputation: 1.0
→ Requiere: Haber ayudado mínimamente

// Proponer cambios
minProposalReputation: 10.0
→ Requiere: Historial de ayuda consistente

// Moderar contenido problemático
minModerateReputation: 5.0
→ Requiere: Ser miembro activo y generoso
```

### Ejemplos Prácticos

#### **Caso 1: Usuario nuevo (troll potencial)**
- `generosityScore = 0`
- ❌ No puede votar
- ❌ No puede proponer
- ❌ No puede moderar
- ✅ Puede participar observando
- ✅ Puede empezar a ayudar para ganar reputación

#### **Caso 2: Usuario activo**
- Ha compartido 10 horas en banco de tiempo
- Ha donado a 2 pools comunitarios
- `generosityScore = 12.5`
- ✅ Puede votar
- ✅ Puede proponer cambios
- ✅ Puede participar en moderación

#### **Caso 3: Fundador (primeros 30 días)**
- `isFounder = true`
- `bootstrapEndDate > now`
- ✅ Puede hacer cambios directos (solo configuración inicial)
- Después de 30 días: **pierde privilegios**, se vuelve miembro normal

## Toma de Decisiones

### 1. **Cambios en la Comunidad**

```
Usuario propone → Discusión 7 días → Votación 3 días → Consenso
```

**Requisitos de consenso:**
- Quorum: 20% de miembros activos deben votar
- Aprobación: 66% de votos a favor
- Votación cuadrática activada

**Ejemplo:**
```
Propuesta: "Cambiar requisito de reputación para proponer de 10 a 5"
- 100 miembros activos
- Necesitan votar: 20 (quorum)
- Votos a favor necesarios: 14 de 20 (66%)
```

### 2. **Moderación de Contenido**

En lugar de "moderadores con poder", usamos **ModerationDAO** (ya implementado):

```typescript
Contenido reportado → Auto-moderación si > 5 reportes → Revisión comunitaria
```

**Proceso:**
1. Usuario reporta contenido problemático
2. Si llega a 5 reportes: revisión automática
3. Miembros con reputación > 5 votan
4. Decisión ponderada por reputación
5. Si 10 reportes: ban temporal automático (reversible por consenso)

### 3. **Eliminación de Comunidad**

**No existe el "delete" unilateral**, ni siquiera para fundadores:

```
❌ DELETE /communities/:id
✅ Propuesta de disolución
   - Requiere 90% de consenso
   - Todos los miembros notificados
   - 14 días de discusión mínimo
```

## Sistema Anti-Trolls

### Automático, No Punitivo

```typescript
autoModerateThreshold: 5      // Revisión automática
banThreshold: 10               // Ban temporal (7 días)
```

**Filosofía**: Incentivos > Castigos

- Trolls no ganan reputación → no tienen voz
- Buenos miembros ganan reputación → más voz
- No hay "policía" decidiendo quién es troll
- La propia comunidad se auto-regula

## Casos de Uso Reales

### 1. **Cambiar horarios de evento comunitario**

```
Usuario con rep > 10 → Crea propuesta
Comunidad discute 7 días
Vota con créditos cuadráticos
Si 66% a favor → Cambio aprobado
```

### 2. **Usuario spammeando**

```
5 usuarios reportan spam
Auto-revisión activada
10+ miembros con rep > 5 votan "REMOVE"
Contenido removido automáticamente
Usuario pierde reputación
Si continúa → ban temporal por consenso
```

### 3. **Conectar con otra comunidad (federación)**

```
Usuario propone: "Conectar con Barrio X"
Ambas comunidades votan
Requiere 66% en AMBAS
Si aprueban → Conexión establecida
→ Comparten ofertas/eventos según configuración
```

## Beneficios del Sistema

### ✅ Ventajas

1. **No hay dictadores**: Nadie tiene poder permanente
2. **Meritocracia real**: Poder = ayuda real, no dinero o posición
3. **Anti-trolls natural**: Trolls no pueden votar ni proponer
4. **Transparencia total**: Toda decisión es visible y auditable
5. **Reversibilidad**: Todo puede ser revertido por consenso
6. **Escalable**: Funciona para 10 personas o 10,000

### ⚠️ Desafíos

1. **Bootstrap inicial**: Primeros 30 días necesitan fundadores
2. **Apatía**: Requiere participación activa de miembros
3. **Complejidad**: Usuarios deben entender el sistema

## Diferencias con Sistemas Tradicionales

| Tradicional | Truk |
|-------------|----------------|
| Admin decide | Comunidad vota |
| Roles permanentes | Reputación temporal |
| Jerarquía | Horizontal |
| Poder = dinero/cargo | Poder = ayuda |
| Moderadores | Auto-moderación |
| Ban unilateral | Consenso comunitario |
| Opaco | Transparente |

## Futuro: Federación

Las comunidades pueden conectarse entre sí:

```
Barrio A ←→ Barrio B
    ↓         ↓
Comarca Completa
    ↓
Región
```

- Cada nivel mantiene autonomía
- Decisiones locales = consenso local
- Decisiones regionales = consenso regional
- No hay "gobierno central"

## Código Relevante

```typescript
// Verificar permisos basados en reputación
const canPropose = user.generosityScore >= community.governance.minProposalReputation;
const canVote = user.generosityScore >= community.governance.minVoteReputation;
const canModerate = user.generosityScore >= community.governance.minModerateReputation;

// Votación cuadrática
const votes = Math.sqrt(creditsSpent);

// Consenso comunitario
const passed = (votesFor / totalVotes) >= (approvalPercentage / 100)
            && (totalVotes / activeMembers) >= (quorumPercentage / 100);
```

## Conclusión

Este sistema **elimina el poder centralizado** y lo reemplaza con **reputación ganada por acciones reales**. No hay jerarquías permanentes, solo consenso comunitario e incentivos para el bien común.

**El poder no se otorga, se gana ayudando.**
