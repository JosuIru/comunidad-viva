# Sistema de Integración con Redes Sociales

## Descripción General

Sistema completo para sincronizar automáticamente anuncios (ofertas, eventos, necesidades de ayuda mutua) con canales externos como Telegram, WhatsApp Business, Discord, Signal y Slack.

## Características Principales

- ✅ **Publicación automática** de contenido en canales externos
- ✅ **Deep links** para derivar usuarios de vuelta a la aplicación
- ✅ **Sistema de colas** (Bull + Redis) para procesamiento asíncrono con reintentos
- ✅ **Múltiples plataformas** soportadas
- ✅ **Preferencias de contacto** por usuario
- ✅ **Interfaz administrativa** para configurar integraciones por comunidad
- ✅ **Sistema de reintentos** automáticos con backoff exponencial
- ✅ **Priorización** de mensajes (necesidades > eventos > ofertas)

---

## Arquitectura

```
┌─────────────────┐
│  Offer Created  │
│  Event Created  │
│  Need Created   │
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│ IntegrationsService     │
│ publishContent()        │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│   Bull Queue (Redis)    │
│   - Priority handling   │
│   - 3 retries           │
│   - Exponential backoff │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│ IntegrationsProcessor   │
│ @Process('publish')     │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    v         v
┌──────┐  ┌──────────┐
│Telegram  │WhatsApp  │
│Service│  │Service   │
└──────┘  └──────────┘
    │         │
    v         v
┌──────────────────────┐
│  External Channels   │
│  (Telegram/WhatsApp) │
└──────────────────────┘
```

---

## Backend

### 1. Modelos de Datos (Prisma)

#### CommunityIntegration
```prisma
model CommunityIntegration {
  id            String              @id @default(uuid())
  communityId   String
  platform      IntegrationPlatform  // TELEGRAM, WHATSAPP_BUSINESS, etc.
  channelId     String               // ID del canal/grupo
  channelName   String?              // Nombre descriptivo
  botToken      String               // Token del bot (encriptado en producción)
  autoPublish   Boolean             @default(false)
  categories    String[]            @default([])
  enabled       Boolean             @default(true)
  publishOffers Boolean             @default(true)
  publishEvents Boolean             @default(true)
  publishNeeds  Boolean             @default(true)
  messageFormat String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  createdBy     String?

  Community     Community           @relation(...)
}
```

#### User (campos añadidos)
```prisma
model User {
  // ... campos existentes
  telegramUsername   String?
  whatsappNumber     String?
  contactPreference  ContactMethod @default(APP)
}

enum ContactMethod {
  APP        // Chat interno (por defecto)
  TELEGRAM   // Redirigir a Telegram
  WHATSAPP   // Redirigir a WhatsApp
  EMAIL      // Mostrar email
  PHONE      // Mostrar teléfono
}
```

### 2. Módulos NestJS

#### IntegrationsModule
```typescript
@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'integrations',
    }),
  ],
  providers: [
    IntegrationsService,
    IntegrationsProcessor,
    TelegramService,
    WhatsAppService,
    MessageFormatterService,
  ],
  controllers: [IntegrationsController],
  exports: [IntegrationsService],
})
```

### 3. Servicios

#### IntegrationsService
**Métodos principales:**
- `create(data)` - Crear integración
- `findAll(communityId)` - Listar integraciones de una comunidad
- `update(id, data)` - Actualizar integración
- `delete(id)` - Eliminar integración
- `toggle(id)` - Activar/desactivar
- `test(id)` - Enviar mensaje de prueba
- `publishContent(contentType, contentId)` - Encolar publicación

#### TelegramService
**Métodos:**
- `validateToken(token)` - Validar token de bot
- `sendMessage(token, channelId, message, buttons)` - Enviar mensaje
- `getChatInfo(token, channelId)` - Obtener info del canal
- `formatMessage(content, deepLink)` - Formatear con Markdown

**Ejemplo de mensaje Telegram:**
```
🎁 *Mesa de madera antigua*

Mesa de roble macizo, perfecto estado.
Medidas: 120x80cm

💰 *Precio:* 50€ o 200 créditos
📍 Barcelona, Gràcia

[Ver en la app](https://app.com/offers/abc123)

#oferta #muebles #barcelona
```

#### WhatsAppService
**Métodos:**
- `validateCredentials(accountSid, authToken)` - Validar credenciales Twilio
- `sendMessage(accountSid, authToken, from, to, message)` - Enviar WhatsApp
- `formatMessage(content, deepLink)` - Formatear para WhatsApp
- `parseBotToken(token)` - Parser `accountSid:authToken:fromNumber`

**Rate limiting:** 60 mensajes/minuto

#### MessageFormatterService
Formatea mensajes según la plataforma:
- **Telegram**: HTML (`<b>`, `<a>`)
- **Discord**: Markdown (`**bold**`, `[link](url)`)
- **WhatsApp/Signal**: Texto plano
- **Slack**: Slack markup (`*bold*`, `<url|text>`)

Límites de caracteres:
- Telegram: 4096
- Discord: 2000
- Slack: 3000
- WhatsApp: 1600

### 4. Sistema de Colas (Bull)

#### Configuración
```typescript
BullModule.registerQueue({
  name: 'integrations',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
})
```

#### Prioridades
```typescript
getJobPriority(contentType: string): number {
  switch (contentType) {
    case 'need': return 1;    // Más urgente
    case 'event': return 2;   // Medio
    case 'offer': return 3;   // Normal
    default: return 5;
  }
}
```

#### Opciones de Job
```typescript
{
  priority: getJobPriority(contentType),
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // 2s, 4s, 8s
  },
  removeOnComplete: true,
  removeOnFail: false, // Mantener para debugging
}
```

### 5. API Endpoints

```typescript
POST   /integrations                          // Crear integración
GET    /integrations/community/:communityId  // Listar por comunidad
GET    /integrations/:id                     // Obtener una
PUT    /integrations/:id                     // Actualizar
DELETE /integrations/:id                     // Eliminar
POST   /integrations/:id/test                // Enviar mensaje de prueba
POST   /integrations/:id/toggle              // Activar/desactivar
POST   /integrations/publish/:type/:id       // Publicar manualmente
```

**Autenticación:** Todos los endpoints requieren JWT válido.

### 6. Integración en OffersService

```typescript
async create(userId: string, data: any) {
  const offer = await this.prisma.offer.create({...});

  // Auto-publicar si la oferta es activa y pertenece a una comunidad
  if (offer.communityId && offer.status === OfferStatus.ACTIVE) {
    try {
      await this.integrationsService.publishContent('offer', offer.id);
    } catch (error) {
      console.error('Failed to publish offer:', error);
      // No falla la creación de oferta si la publicación falla
    }
  }

  return offer;
}
```

---

## Frontend

### 1. Página de Administración

**Ruta:** `/comunidades/[slug]/integrations`

**Componentes principales:**
- Lista de integraciones existentes (grid)
- Modal para crear/editar integración
- Botones de acción (test, toggle, delete)
- Toast notifications

**Características:**
- Dark mode support
- Responsive design (mobile-first)
- React Query para caché y optimistic updates
- Validación de formularios
- Confirmación para acciones destructivas

**Plataformas soportadas:**
- Telegram ✈️
- WhatsApp 💬
- Discord 🎮
- Signal 🔒
- Slack 💼

### 2. Vista de Ofertas

**Archivo:** `/pages/offers/[id].tsx`

**Cambios:**
- Añadida sección "Contacto directo" si `contactPreference !== 'APP'`
- Botones/enlaces para contacto externo:
  - Telegram: `https://t.me/{username}`
  - WhatsApp: `https://wa.me/{number}`
  - Email: `mailto:{email}`
  - Teléfono: `tel:{phone}`

**Iconos:**
- 📱 Telegram
- 💬 WhatsApp
- ✉️ Email
- 📞 Teléfono

### 3. Traducciones

Añadidas en `es.json`, `en.json`, `ca.json`, `eu.json`:
```json
{
  "contact": {
    "title": "Contacto directo",
    "telegram": "Contactar vía Telegram",
    "whatsapp": "Contactar vía WhatsApp",
    "email": "Contactar por email",
    "phone": "Contactar por teléfono"
  }
}
```

---

## Configuración

### Variables de Entorno (.env)

```bash
# Redis (para Bull queue)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Opcional: Base URL para deep links
APP_BASE_URL=https://tuapp.com
```

### Dependencias npm

```json
{
  "dependencies": {
    "node-telegram-bot-api": "^0.66.0",
    "twilio": "^5.0.0",
    "@nestjs/bull": "^10.0.1",
    "bull": "^4.11.5",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "@types/node-telegram-bot-api": "^0.64.0"
  }
}
```

---

## Migración de Base de Datos

**Archivo:** `prisma/migrations/20251120000000_add_social_integrations/migration.sql`

Para aplicar la migración cuando la base de datos esté disponible:

```bash
cd packages/backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
# o para desarrollo:
DATABASE_URL="postgresql://..." npx prisma migrate dev
```

---

## Configuración de Bots

### Telegram

1. Crear bot con [@BotFather](https://t.me/botfather)
2. Comando: `/newbot`
3. Copiar el token (formato: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Añadir bot a tu canal/grupo
5. Hacerlo administrador con permiso de enviar mensajes
6. Obtener chat ID del canal (formato: `@nombre_canal` o `-100123456789`)

### WhatsApp Business (Twilio)

1. Crear cuenta en [Twilio](https://www.twilio.com/)
2. Activar WhatsApp Business API
3. Obtener:
   - Account SID
   - Auth Token
   - From Number (formato: `whatsapp:+1234567890`)
4. Token en app: `accountSid:authToken:whatsapp:+1234567890`

### Discord

1. Crear aplicación en [Discord Developer Portal](https://discord.com/developers)
2. Crear bot y copiar token
3. Invitar bot al servidor con permisos de "Send Messages"
4. Obtener Channel ID (activar Developer Mode en Discord)

---

## Testing

### Test Manual de Integración

1. Crear integración desde el UI admin
2. Click en "Probar Integración"
3. Verificar que llega mensaje al canal
4. Crear una oferta en esa comunidad
5. Verificar publicación automática

### Test de Cola

```typescript
// Ver trabajos en cola
import Bull from 'bull';
const queue = new Bull('integrations', process.env.REDIS_URL);

// Ver trabajos activos
const active = await queue.getActive();
console.log('Active jobs:', active);

// Ver trabajos fallidos
const failed = await queue.getFailed();
console.log('Failed jobs:', failed);

// Limpiar trabajos completados
await queue.clean(60000); // Más de 1 minuto
```

### Verificar Redis

```bash
redis-cli
> KEYS bull:integrations:*
> LLEN bull:integrations:waiting
> LLEN bull:integrations:active
> LLEN bull:integrations:failed
```

---

## Seguridad

### Tokens de Bot

**⚠️ IMPORTANTE:** En producción, los tokens deben:
1. Estar encriptados en base de datos
2. Nunca aparecer en logs
3. Transmitirse solo por HTTPS
4. Rotarse periódicamente

### Autenticación

- Todos los endpoints requieren JWT
- Solo admins de comunidad pueden gestionar integraciones
- Verificar permisos en cada operación

### Rate Limiting

- WhatsApp: 60 msg/min (implementado)
- Telegram: 30 msg/seg (límite de API)
- Implementar rate limiting global si es necesario

---

## Monitoreo y Logs

### Logs Importantes

```typescript
// Integración creada
[IntegrationsService] Integration created: ${id} for community ${communityId}

// Mensaje publicado
[IntegrationsService] Queued ${jobs.length} publish jobs for ${contentType}

// Trabajo procesado
[IntegrationsProcessor] Processing publish job for ${contentType} ${contentId}

// Éxito
[IntegrationsProcessor] Successfully published ${contentType} ${contentId}

// Error
[IntegrationsProcessor] Failed to publish after ${job.attemptsMade} attempts
```

### Métricas a Monitorear

- Trabajos en cola (waiting)
- Trabajos activos (active)
- Trabajos fallidos (failed)
- Tiempo promedio de procesamiento
- Tasa de error por plataforma

---

## Troubleshooting

### Problema: Mensajes no se envían

**Posibles causas:**
1. Redis no está corriendo → Verificar con `redis-cli ping`
2. Token inválido → Probar con endpoint `/test`
3. Bot sin permisos → Verificar permisos en canal
4. Rate limit excedido → Revisar logs

### Problema: Trabajos se quedan en "active"

**Solución:**
```typescript
// Limpiar trabajos estancados
const queue = new Bull('integrations', REDIS_URL);
await queue.clean(0, 'active');
```

### Problema: Duplicados

**Causa:** Reintentos exitosos pero marcados como fallidos.
**Solución:** Verificar que el servicio devuelve correctamente.

---

## Roadmap / TODOs

### Corto plazo
- [ ] Implementar Discord service completo
- [ ] Implementar Slack service completo
- [ ] Implementar Signal service
- [ ] Encriptación de tokens en DB
- [ ] Tests unitarios y e2e
- [ ] Panel de métricas en admin UI

### Medio plazo
- [ ] Soporte para imágenes en mensajes
- [ ] Templates customizables de mensajes
- [ ] Webhooks inversos (recibir mensajes)
- [ ] Comandos de bot (ej: `/ofertas`, `/ayuda`)
- [ ] Moderación automática de spam

### Largo plazo
- [ ] Machine learning para optimizar horarios
- [ ] A/B testing de formatos de mensaje
- [ ] Integración con Google Business Messages
- [ ] Sincronización bidireccional
- [ ] Analytics avanzados

---

## Contacto y Soporte

Para preguntas sobre este sistema:
- Revisar logs en `/var/log/nestjs/`
- Comprobar estado de Redis
- Verificar permisos de bots
- Consultar documentación de plataformas

---

## Referencias

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Bull Queue](https://github.com/OptimalBits/bull)
- [Discord Bot Guide](https://discord.com/developers/docs)
- [NestJS Bull Module](https://docs.nestjs.com/techniques/queues)

---

**Versión:** 1.0.0
**Fecha:** 2025-11-20
**Autor:** Sistema de Integración Social - Comunidad Viva
