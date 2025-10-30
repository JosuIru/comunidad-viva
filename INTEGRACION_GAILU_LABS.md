# 🌀 Plan de Integración: Comunidad Viva → Ecosistema Gailu Labs

**Versión:** 1.0
**Fecha:** Octubre 2025
**Estado:** 🚀 En Desarrollo

---

## 📋 Resumen Ejecutivo

Comunidad Viva es actualmente una red social colaborativa standalone. Este documento describe el plan para integrarla completamente en el **ecosistema Gailu Labs**, convirtiéndola en un nodo federado que se conecta con:

- **Spiral Bank** (finanzas cooperativas)
- **FLUJO** (educación viral)
- **Red de Cuidados** (apoyo mutuo)
- **Academia Espiral** (aprendizaje)
- **Democracia Universal** (gobernanza)
- **Mercado Espiral** (comercio local)
- **Pueblo Vivo** (desarrollo rural)

---

## 🎯 Objetivos de la Integración

### 1. **Federación de Identidad**
- [ ] Los usuarios de Comunidad Viva pueden usar su identidad en todo el ecosistema Gailu
- [ ] Sistema DID (Decentralized Identifier)
- [ ] SSO (Single Sign-On) entre aplicaciones

### 2. **Economía Integrada**
- [ ] Token SEMILLA como moneda principal
- [ ] Integración con Proof-of-Help (reputación)
- [ ] HOURS (banco de tiempo) como segunda moneda
- [ ] Conexión con Spiral Bank

### 3. **Contenido Federado**
- [ ] Protocolo ActivityPub
- [ ] Los posts de Comunidad Viva se ven en otros nodos
- [ ] Contenido de FLUJO se muestra en Comunidad Viva

### 4. **Círculos de Conciencia**
- [ ] Nueva sección para transformación personal/colectiva
- [ ] Integración con prácticas contemplativas
- [ ] Seguimiento de evolución personal

### 5. **Gobernanza Descentralizada**
- [ ] Conexión con DAO Gailu Share
- [ ] Propuestas y votaciones inter-nodos
- [ ] Proof-of-Help como peso de voto

---

## 🏗️ Arquitectura Técnica de la Integración

### Estado Actual (Standalone)
```
┌─────────────────────────────────────┐
│      COMUNIDAD VIVA v1.0            │
│                                     │
│  ├─ Backend (NestJS)               │
│  ├─ Frontend (Next.js)             │
│  ├─ PostgreSQL                     │
│  ├─ JWT Auth                       │
│  └─ Créditos locales              │
└─────────────────────────────────────┘
```

### Estado Futuro (Federado)
```
┌────────────────────────────────────────────────────────┐
│           ECOSISTEMA GAILU LABS                        │
│                                                        │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────┐│
│  │ Comunidad Viva │←→│ Spiral Bank  │←→│   FLUJO   ││
│  │   (Nodo 1)     │  │   (Nodo 2)   │  │ (Nodo 3)  ││
│  └────────────────┘  └──────────────┘  └───────────┘│
│           ↕                  ↕                ↕       │
│  ┌────────────────────────────────────────────────┐  │
│  │     CAPA DE FEDERACIÓN (Protocol Layer)       │  │
│  │  - DID (Identidad)                            │  │
│  │  - ActivityPub (Contenido)                    │  │
│  │  - Token SEMILLA (Valor)                      │  │
│  │  - Proof-of-Help (Reputación)                 │  │
│  │  - Smart Contracts (Inter-nodos)              │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │          DAO GAILU SHARE (Gobernanza)          │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 📦 Fases de Implementación

### **FASE 1: Fundamentos (Semanas 1-4)**

#### 1.1 Adaptar Base de Datos
```sql
-- Añadir campos para federación

ALTER TABLE "User" ADD COLUMN "gailuDID" VARCHAR(255) UNIQUE;
ALTER TABLE "User" ADD COLUMN "gailuNodeId" VARCHAR(100) DEFAULT 'comunidad-viva-main';
ALTER TABLE "User" ADD COLUMN "semillaBalance" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "hoursBalance" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "proofOfHelpScore" INTEGER DEFAULT 0;

-- Tabla de conexiones federadas
CREATE TABLE "FederatedNode" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nodeId VARCHAR(100) UNIQUE NOT NULL,
  nodeName VARCHAR(255) NOT NULL,
  nodeType VARCHAR(50) NOT NULL, -- 'comunidad-viva', 'spiral-bank', 'flujo', etc.
  endpoint VARCHAR(500) NOT NULL,
  publicKey TEXT NOT NULL,
  federatedSince TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- Tabla de actividades federadas (ActivityPub)
CREATE TABLE "FederatedActivity" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activityId VARCHAR(500) UNIQUE NOT NULL,
  activityType VARCHAR(50) NOT NULL, -- 'Create', 'Update', 'Delete', 'Like'
  actor VARCHAR(500) NOT NULL, -- DID del usuario
  object JSONB NOT NULL,
  published TIMESTAMP NOT NULL,
  originNode VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Tabla de transacciones SEMILLA inter-nodos
CREATE TABLE "SemillaTransaction" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fromDID VARCHAR(255) NOT NULL,
  toDID VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  reason VARCHAR(500),
  fromNode VARCHAR(100),
  toNode VARCHAR(100),
  fee DECIMAL(10,2) DEFAULT 0,
  timestamp TIMESTAMP DEFAULT NOW(),
  txHash VARCHAR(256), -- Hash blockchain si se usa
  verified BOOLEAN DEFAULT false
);
```

#### 1.2 Crear Módulo de Federación
```bash
# En el backend
cd packages/backend/src
npx nest generate module federation
npx nest generate service federation/federation
npx nest generate controller federation/federation
npx nest generate service federation/did
npx nest generate service federation/activitypub
npx nest generate service federation/semilla
```

---

### **FASE 2: Identidad Descentralizada - DID (Semanas 5-8)**

#### 2.1 Implementar DID Service

```typescript
// packages/backend/src/federation/did.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class DIDService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generar DID para un usuario
   * Formato: did:gailu:comunidad-viva:user:uuid
   */
  async generateDID(userId: string, nodeId: string = 'comunidad-viva-main'): Promise<string> {
    const did = `did:gailu:${nodeId}:user:${userId}`;

    // Actualizar usuario con su DID
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        gailuDID: did,
        gailuNodeId: nodeId
      }
    });

    return did;
  }

  /**
   * Resolver DID a perfil de usuario
   */
  async resolveDID(did: string) {
    const user = await this.prisma.user.findUnique({
      where: { gailuDID: did },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        proofOfHelpScore: true,
        semillaBalance: true,
        hoursBalance: true,
        gailuNodeId: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error(`DID not found: ${did}`);
    }

    return {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      profile: {
        name: user.name,
        avatar: user.avatar,
        bio: user.bio
      },
      reputation: {
        proofOfHelp: user.proofOfHelpScore,
        semilla: user.semillaBalance,
        hours: user.hoursBalance
      },
      node: user.gailuNodeId,
      service: [{
        type: 'GailuProfile',
        serviceEndpoint: `https://comunidad-viva.gailu.network/users/${user.id}`
      }],
      created: user.createdAt
    };
  }

  /**
   * Verificar firma de DID
   */
  async verifyDIDSignature(did: string, signature: string, data: any): Promise<boolean> {
    // TODO: Implementar verificación criptográfica
    // Por ahora, placeholder
    return true;
  }
}
```

#### 2.2 Migrar usuarios existentes a DID

```typescript
// Script de migración
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToDID() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    if (!user.gailuDID) {
      const did = `did:gailu:comunidad-viva-main:user:${user.id}`;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          gailuDID: did,
          gailuNodeId: 'comunidad-viva-main',
          proofOfHelpScore: user.generosityScore || 0, // Migrar score existente
          semillaBalance: Math.floor(user.credits / 10) || 0, // 10 créditos = 1 SEMILLA
          hoursBalance: 0
        }
      });
      console.log(`✅ Migrated user ${user.name} to DID: ${did}`);
    }
  }

  console.log(`🎉 Migrated ${users.length} users to DID`);
}

migrateToDID();
```

---

### **FASE 3: Token SEMILLA (Semanas 9-12)**

#### 3.1 Implementar Semilla Service

```typescript
// packages/backend/src/federation/semilla.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SemillaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Transferir SEMILLA entre usuarios
   */
  async transfer(
    fromDID: string,
    toDID: string,
    amount: number,
    reason: string
  ) {
    // Validar balance
    const fromUser = await this.prisma.user.findUnique({
      where: { gailuDID: fromDID }
    });

    if (!fromUser || fromUser.semillaBalance < amount) {
      throw new Error('Insufficient SEMILLA balance');
    }

    // Calcular fee (1% para el nodo)
    const fee = Math.ceil(amount * 0.01);
    const netAmount = amount - fee;

    // Ejecutar transacción
    const [fromUpdate, toUpdate, tx] = await this.prisma.$transaction([
      // Restar de origen
      this.prisma.user.update({
        where: { gailuDID: fromDID },
        data: { semillaBalance: { decrement: amount } }
      }),
      // Sumar a destino
      this.prisma.user.update({
        where: { gailuDID: toDID },
        data: { semillaBalance: { increment: netAmount } }
      }),
      // Registrar transacción
      this.prisma.semillaTransaction.create({
        data: {
          fromDID,
          toDID,
          amount: netAmount,
          reason,
          fromNode: fromUser.gailuNodeId,
          toNode: (await this.prisma.user.findUnique({ where: { gailuDID: toDID } })).gailuNodeId,
          fee,
          verified: true
        }
      })
    ]);

    // Emitir evento de transferencia
    // TODO: Notificar a blockchain si está configurado

    return {
      success: true,
      transaction: tx,
      newBalances: {
        from: fromUpdate.semillaBalance,
        to: toUpdate.semillaBalance
      }
    };
  }

  /**
   * Recompensar con SEMILLA por ayuda (Proof-of-Help)
   */
  async rewardProofOfHelp(userDID: string, helpType: string, amount: number) {
    const user = await this.prisma.user.update({
      where: { gailuDID: userDID },
      data: {
        semillaBalance: { increment: amount },
        proofOfHelpScore: { increment: amount * 10 } // 1 SEMILLA = 10 puntos PoH
      }
    });

    // Registrar en historial
    await this.prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount,
        description: `Proof-of-Help: ${helpType}`,
        type: 'PROOF_OF_HELP',
        relatedEntityType: 'HELP',
        balanceAfter: user.semillaBalance
      }
    });

    return user;
  }

  /**
   * Obtener balance de SEMILLA
   */
  async getBalance(userDID: string) {
    const user = await this.prisma.user.findUnique({
      where: { gailuDID: userDID },
      select: {
        semillaBalance: true,
        hoursBalance: true,
        proofOfHelpScore: true
      }
    });

    return user;
  }

  /**
   * Historial de transacciones
   */
  async getTransactionHistory(userDID: string, limit = 50) {
    return this.prisma.semillaTransaction.findMany({
      where: {
        OR: [
          { fromDID: userDID },
          { toDID: userDID }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}
```

#### 3.2 Endpoints API para SEMILLA

```typescript
// packages/backend/src/federation/federation.controller.ts

import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SemillaService } from './semilla.service';
import { User } from '../decorators/user.decorator';

@Controller('federation/semilla')
@UseGuards(JwtAuthGuard)
export class SemillaController {
  constructor(private semillaService: SemillaService) {}

  @Post('transfer')
  async transfer(@User() user, @Body() body: {
    toDID: string;
    amount: number;
    reason: string;
  }) {
    return this.semillaService.transfer(
      user.gailuDID,
      body.toDID,
      body.amount,
      body.reason
    );
  }

  @Get('balance')
  async getBalance(@User() user) {
    return this.semillaService.getBalance(user.gailuDID);
  }

  @Get('transactions')
  async getTransactions(@User() user) {
    return this.semillaService.getTransactionHistory(user.gailuDID);
  }
}
```

---

### **FASE 4: ActivityPub - Federación de Contenido (Semanas 13-16)**

#### 4.1 Implementar ActivityPub Service

```typescript
// packages/backend/src/federation/activitypub.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ActivityPubService {
  constructor(private prisma: PrismaService) {}

  /**
   * Publicar actividad en la red federada
   */
  async publishActivity(activity: {
    type: 'Create' | 'Update' | 'Delete' | 'Like';
    actor: string; // DID del usuario
    object: any;
  }) {
    const activityId = `https://comunidad-viva.gailu.network/activities/${Date.now()}`;

    const activityPubFormat = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: activityId,
      type: activity.type,
      actor: activity.actor,
      object: activity.object,
      published: new Date().toISOString(),
      to: ['https://gailu.network/public'] // Público en toda la red
    };

    // Guardar localmente
    await this.prisma.federatedActivity.create({
      data: {
        activityId,
        activityType: activity.type,
        actor: activity.actor,
        object: activity.object,
        published: new Date(),
        originNode: 'comunidad-viva-main'
      }
    });

    // Distribuir a nodos federados
    await this.distributeToFederatedNodes(activityPubFormat);

    return activityPubFormat;
  }

  /**
   * Distribuir actividad a otros nodos
   */
  private async distributeToFederatedNodes(activity: any) {
    const federatedNodes = await this.prisma.federatedNode.findMany({
      where: { active: true }
    });

    const promises = federatedNodes.map(node =>
      axios.post(`${node.endpoint}/federation/inbox`, activity, {
        headers: {
          'Content-Type': 'application/activity+json'
        }
      }).catch(err => {
        console.error(`Failed to distribute to ${node.nodeName}:`, err.message);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Recibir actividad de otro nodo
   */
  async receiveActivity(activity: any) {
    // Validar actividad
    if (!activity['@context'] || !activity.type || !activity.actor) {
      throw new Error('Invalid ActivityPub object');
    }

    // Guardar actividad
    await this.prisma.federatedActivity.create({
      data: {
        activityId: activity.id,
        activityType: activity.type,
        actor: activity.actor,
        object: activity.object,
        published: new Date(activity.published),
        originNode: this.extractNodeFromDID(activity.actor)
      }
    });

    // Procesar según tipo
    switch (activity.type) {
      case 'Create':
        await this.handleCreate(activity);
        break;
      case 'Like':
        await this.handleLike(activity);
        break;
      // ... otros tipos
    }

    return { received: true };
  }

  private extractNodeFromDID(did: string): string {
    // did:gailu:nodeId:user:uuid -> extraer nodeId
    const parts = did.split(':');
    return parts[2] || 'unknown';
  }

  private async handleCreate(activity: any) {
    // Cuando otro nodo crea contenido, mostrarlo en feed federado
    console.log('Received Create activity from federated node:', activity);
  }

  private async handleLike(activity: any) {
    // Incrementar likes en contenido local
    console.log('Received Like activity from federated node:', activity);
  }
}
```

---

### **FASE 5: Círculos de Conciencia (Semanas 17-20)**

#### 5.1 Nuevo Modelo de Base de Datos

```prisma
// packages/backend/prisma/schema.prisma

model CirculoConciencia {
  id                String   @id @default(uuid())
  tipo              CirculoTipo
  titulo            String
  descripcion       String
  fecha             DateTime
  duracion          Int      // minutos
  maxParticipantes  Int      @default(20)

  // Ubicación
  modalidad         ModalidadCirculo
  direccion         String?
  enlaceVideo       String?

  // Facilitación
  facilitadorId     String
  facilitador       User     @relation("FacilitadorCirculos", fields: [facilitadorId], references: [id])

  // Participantes
  participantes     CirculoParticipacion[]

  // Recursos
  recursos          Json     @default("{}")
  tema              String?
  lecturas          String[]

  // Económico
  contribucionTipo  ContribucionTipo
  semillaRecompensa Int?
  hoursRecompensa   Decimal?

  // Impacto
  asistencia        Int      @default(0)
  retroalimentacion Json     @default("[]")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum CirculoTipo {
  REFLEXION
  CONTEMPLATIVA
  FILOSOFICO
  VISION
  RESTAURACION
  CELEBRACION
}

enum ModalidadCirculo {
  PRESENCIAL
  ONLINE
  HIBRIDO
}

enum ContribucionTipo {
  GRATUITO
  DONACION
  INTERCAMBIO
}

model CirculoParticipacion {
  id          String   @id @default(uuid())
  circuloId   String
  circulo     CirculoConciencia @relation(fields: [circuloId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  // Seguimiento
  asistio     Boolean  @default(false)
  feedback    String?
  compromisos Json     @default("[]")

  registradoEn DateTime @default(now())

  @@unique([circuloId, userId])
}

// Añadir a User model
model User {
  // ... campos existentes ...

  // Círculos de Conciencia
  circulosFacilitados  CirculoConciencia[] @relation("FacilitadorCirculos")
  circulosParticipados CirculoParticipacion[]

  // Métricas de transformación
  circulosAsistidos    Int      @default(0)
  horasPractica        Decimal  @default(0)
  facilitacionesRealizadas Int  @default(0)

  // Áreas de crecimiento (self-reported)
  escuchaProfunda      Int      @default(0) // 0-100
  presencia            Int      @default(0)
  expresionAutentica   Int      @default(0)
  resolucionConflictos Int      @default(0)
  visionColectiva      Int      @default(0)
}
```

#### 5.2 Servicio de Círculos

```typescript
// packages/backend/src/circulos/circulos.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SemillaService } from '../federation/semilla.service';

@Injectable()
export class CirculosService {
  constructor(
    private prisma: PrismaService,
    private semillaService: SemillaService
  ) {}

  /**
   * Crear nuevo círculo
   */
  async create(facilitadorId: string, data: any) {
    const circulo = await this.prisma.circuloConciencia.create({
      data: {
        ...data,
        facilitadorId
      },
      include: {
        facilitador: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Publicar en ActivityPub
    // await this.activityPubService.publishActivity({
    //   type: 'Create',
    //   actor: facilitador.gailuDID,
    //   object: { type: 'CirculoConciencia', ...circulo }
    // });

    return circulo;
  }

  /**
   * Registrarse en un círculo
   */
  async register(circuloId: string, userId: string) {
    const circulo = await this.prisma.circuloConciencia.findUnique({
      where: { id: circuloId },
      include: { _count: { select: { participantes: true } } }
    });

    if (circulo._count.participantes >= circulo.maxParticipantes) {
      throw new Error('Círculo completo');
    }

    const participacion = await this.prisma.circuloParticipacion.create({
      data: {
        circuloId,
        userId
      }
    });

    return participacion;
  }

  /**
   * Marcar asistencia y recompensar facilitador
   */
  async confirmarAsistencia(circuloId: string, userId: string, feedback?: string) {
    const participacion = await this.prisma.circuloParticipacion.update({
      where: {
        circuloId_userId: { circuloId, userId }
      },
      data: {
        asistio: true,
        feedback
      }
    });

    // Actualizar métricas del usuario
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        circulosAsistidos: { increment: 1 }
      }
    });

    // Obtener círculo
    const circulo = await this.prisma.circuloConciencia.findUnique({
      where: { id: circuloId },
      include: { facilitador: true }
    });

    // Recompensar al facilitador con SEMILLA
    if (circulo.semillaRecompensa && circulo.semillaRecompensa > 0) {
      await this.semillaService.rewardProofOfHelp(
        circulo.facilitador.gailuDID,
        'Facilitación de Círculo de Conciencia',
        circulo.semillaRecompensa
      );
    }

    return participacion;
  }

  /**
   * Dashboard de transformación personal
   */
  async getMiCamino(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        circulosAsistidos: true,
        horasPractica: true,
        facilitacionesRealizadas: true,
        escuchaProfunda: true,
        presencia: true,
        expresionAutentica: true,
        resolucionConflictos: true,
        visionColectiva: true
      }
    });

    const proximosCirculos = await this.prisma.circuloConciencia.findMany({
      where: {
        fecha: { gte: new Date() }
      },
      orderBy: { fecha: 'asc' },
      take: 5,
      include: {
        facilitador: {
          select: { name: true, avatar: true }
        }
      }
    });

    return {
      metricas: user,
      proximosCirculos
    };
  }
}
```

---

### **FASE 6: Frontend - UI Federada (Semanas 21-24)**

#### 6.1 Nuevo Tab: "Ecosistema Gailu"

```typescript
// packages/web/src/pages/ecosistema.tsx

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function EcosistemaGailu() {
  const [balance, setBalance] = useState({ semilla: 0, hours: 0, poh: 0 });
  const [federatedContent, setFederatedContent] = useState([]);

  useEffect(() => {
    // Cargar balance de SEMILLA
    fetch('/api/federation/semilla/balance')
      .then(res => res.json())
      .then(data => setBalance(data));

    // Cargar contenido federado de otros nodos
    fetch('/api/federation/activities/federated')
      .then(res => res.json())
      .then(data => setFederatedContent(data));
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">🌀 Ecosistema Gailu Labs</h1>

        {/* Balance Multi-Moneda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">💎 SEMILLA</h3>
            <p className="text-4xl font-bold text-green-600">{balance.semilla}</p>
            <p className="text-sm text-gray-500">Moneda del ecosistema</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">⏰ HOURS</h3>
            <p className="text-4xl font-bold text-blue-600">{balance.hours}</p>
            <p className="text-sm text-gray-500">Banco de tiempo</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">⚖️ Proof-of-Help</h3>
            <p className="text-4xl font-bold text-purple-600">{balance.poh}</p>
            <p className="text-sm text-gray-500">Reputación</p>
          </div>
        </div>

        {/* Nodos Conectados */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔗 Nodos Federados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NodeCard name="Spiral Bank" icon="🏦" status="connected" />
            <NodeCard name="FLUJO" icon="📹" status="connected" />
            <NodeCard name="Red de Cuidados" icon="🤝" status="connected" />
            <NodeCard name="Academia Espiral" icon="🎓" status="connecting" />
            <NodeCard name="Democracia Universal" icon="🗳️" status="planning" />
            <NodeCard name="Mercado Espiral" icon="🛒" status="planning" />
            <NodeCard name="Pueblo Vivo" icon="🏘️" status="planning" />
            <NodeCard name="Kulturaka" icon="🎨" status="planning" />
          </div>
        </div>

        {/* Feed Federado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">🌍 Feed Global (Todos los Nodos)</h2>
          <div className="space-y-4">
            {federatedContent.map(activity => (
              <FederatedActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function NodeCard({ name, icon, status }: { name: string; icon: string; status: string }) {
  const statusColors = {
    connected: 'bg-green-100 text-green-800',
    connecting: 'bg-yellow-100 text-yellow-800',
    planning: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="border rounded-lg p-4 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <h4 className="font-semibold mb-2">{name}</h4>
      <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  );
}
```

#### 6.2 Componente: Círculos de Conciencia

```typescript
// packages/web/src/components/CirculosConciencia.tsx

import { useState, useEffect } from 'react';

export default function CirculosConciencia() {
  const [circulos, setCirculos] = useState([]);
  const [miCamino, setMiCamino] = useState(null);

  useEffect(() => {
    fetch('/api/circulos/proximos')
      .then(res => res.json())
      .then(data => setCirculos(data));

    fetch('/api/circulos/mi-camino')
      .then(res => res.json())
      .then(data => setMiCamino(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🌀 Círculos de Conciencia</h1>

      {/* Mi Camino de Transformación */}
      {miCamino && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Mi Camino de Transformación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm opacity-80">Círculos asistidos</p>
              <p className="text-3xl font-bold">{miCamino.metricas.circulosAsistidos}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Horas de práctica</p>
              <p className="text-3xl font-bold">{miCamino.metricas.horasPractica}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Facilitaciones</p>
              <p className="text-3xl font-bold">{miCamino.metricas.facilitacionesRealizadas}</p>
            </div>
          </div>

          {/* Áreas de Crecimiento */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-3">Áreas de Crecimiento</h3>
            <ProgressBar label="🌱 Escucha profunda" value={miCamino.metricas.escuchaProfunda} />
            <ProgressBar label="🌱 Presencia" value={miCamino.metricas.presencia} />
            <ProgressBar label="🌱 Expresión auténtica" value={miCamino.metricas.expresionAutentica} />
            <ProgressBar label="🌱 Resolución de conflictos" value={miCamino.metricas.resolucionConflictos} />
            <ProgressBar label="🌱 Visión colectiva" value={miCamino.metricas.visionColectiva} />
          </div>
        </div>
      )}

      {/* Próximos Círculos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Próximos Círculos</h2>
        <div className="space-y-4">
          {circulos.map(circulo => (
            <CirculoCard key={circulo.id} circulo={circulo} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
        <div
          className="bg-white h-2 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CirculoCard({ circulo }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{circulo.titulo}</h3>
          <p className="text-gray-600 text-sm">{circulo.descripcion}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>📅 {new Date(circulo.fecha).toLocaleDateString()}</span>
            <span>⏱️ {circulo.duracion} min</span>
            <span>👥 {circulo.asistencia}/{circulo.maxParticipantes}</span>
          </div>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Registrarme
        </button>
      </div>
    </div>
  );
}
```

---

## 📊 Métricas de Éxito de la Integración

### Indicadores Técnicos
- [ ] 100% usuarios migrados a DID
- [ ] 95%+ uptime de federación
- [ ] <500ms latencia inter-nodos
- [ ] 0 fallos críticos de sincronización

### Indicadores de Adopción
- [ ] 50%+ usuarios con balance SEMILLA activo
- [ ] 20%+ usuarios participando en círculos
- [ ] 10+ actividades federadas/día
- [ ] 5+ nodos conectados

### Indicadores de Impacto
- [ ] Incremento 30% en engagement
- [ ] 50+ transferencias SEMILLA/semana
- [ ] 100+ asistentes a círculos/mes
- [ ] Net Promoter Score > 50

---

## 🚀 Próximos Pasos Inmediatos

1. **Esta Semana:**
   - [ ] Revisar y aprobar este plan
   - [ ] Configurar repositorio para desarrollo federado
   - [ ] Diseñar schema de BD completo

2. **Próximas 2 Semanas:**
   - [ ] Implementar DID Service
   - [ ] Migración de usuarios existentes
   - [ ] Tests de identidad federada

3. **Mes 1:**
   - [ ] Token SEMILLA funcional
   - [ ] Primera transferencia inter-usuarios
   - [ ] Dashboard de economía multi-valor

4. **Mes 2:**
   - [ ] ActivityPub básico
   - [ ] Primer contenido federado visible
   - [ ] Conectar con un nodo piloto

5. **Mes 3:**
   - [ ] Círculos de Conciencia MVP
   - [ ] Primer círculo realizado
   - [ ] Dashboard de transformación

---

## 📞 Contacto y Coordinación

**Coordinador Técnico:** [Tu nombre]
**Nodo:** Comunidad Viva (Nodo Génesis)
**Slack:** #comunidad-viva-integration
**Repo:** https://github.com/gailu-labs/comunidad-viva

---

**Versión:** 1.0
**Estado:** 🟢 Aprobado para Desarrollo
**Próxima Revisión:** Cada 2 semanas

🌀 **¡La espiral comienza!**
