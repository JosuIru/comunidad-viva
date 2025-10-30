# Security Policy

## Medidas de Seguridad Implementadas

Este documento describe las medidas de seguridad implementadas en Comunidad Viva para proteger la plataforma y los datos de los usuarios.

---

## 🔒 Autenticación y Autorización

### Sistema de Roles

La plataforma implementa un sistema de roles basado en tres niveles:

- **CITIZEN**: Usuario estándar con acceso a funcionalidades básicas
- **MERCHANT**: Comerciante local con permisos para gestionar ofertas comerciales
- **ADMIN**: Administrador con acceso completo a funcionalidades administrativas

**Documentación completa**: Ver [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md)

### JWT (JSON Web Tokens)

- ✅ **Tokens firmados** con algoritmo HS256
- ✅ **Expiración configurada** (7 días por defecto)
- ✅ **Refresh tokens** no implementados aún (roadmap)
- ✅ **Bearer token** en Authorization header

### Guards Implementados

1. **JwtAuthGuard**: Valida token JWT en requests
2. **RolesGuard**: Valida roles requeridos para endpoints
3. **LocalAuthGuard**: Valida credenciales en login

**Orden correcto de guards**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

---

## 🛡️ Rate Limiting

### Configuración Global

**Límite por defecto**: 100 requests por minuto por IP

Implementado con `@nestjs/throttler` a nivel global en `app.module.ts`.

### Rate Limiting por Endpoint

| Endpoint | Límite | TTL | Razón |
|----------|--------|-----|-------|
| `POST /auth/register` | 5 req | 60s | Prevenir spam de registros |
| `POST /auth/login` | 10 req | 60s | Prevenir brute force attacks |
| `POST /credits/grant` | 30 req | 60s | Limitar operaciones de créditos |
| Admin endpoints | 20 req | 60s | Limitar operaciones administrativas |

### Respuesta HTTP 429

Cuando se excede el rate limit, la API responde con:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**Headers incluidos**:
- `X-RateLimit-Limit`: Límite total
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp cuando se resetea el límite

---

## 🔐 Validación de Ownership

### Protección de Perfiles

Los usuarios solo pueden modificar su propio perfil, excepto administradores:

```typescript
// ✅ CORRECTO: Usuario actualiza su propio perfil
PUT /users/user-123 (con JWT de user-123)

// ❌ BLOQUEADO: Usuario intenta actualizar perfil ajeno
PUT /users/user-456 (con JWT de user-123)
// Respuesta: 403 Forbidden

// ✅ PERMITIDO: Admin actualiza cualquier perfil
PUT /users/user-456 (con JWT de admin-123, role: ADMIN)
```

**Implementación**: `src/users/users.service.ts:23-41`

---

## 📊 Endpoints Protegidos

### Por Rol ADMIN

**Total**: 17 endpoints requieren rol ADMIN

#### Credits
- `POST /credits/grant` - Otorgar créditos

#### Communities
- `GET /communities/audit-log` - Ver logs de auditoría

#### Viral Features (Admin Operations)
- `POST /viral-features/admin/create-flash-deals`
- `POST /viral-features/admin/activate-happy-hour`
- `POST /viral-features/admin/create-weekly-challenge`
- `POST /viral-features/admin/clean-expired-stories`
- `POST /viral-features/admin/reset-daily-actions`
- `POST /viral-features/admin/update-streaks`

#### Analytics
- `GET /analytics/community/metrics`
- `GET /analytics/timeseries`
- `GET /analytics/export/csv`

#### Flow Economics
- `GET /flow-economics/metrics`
- `GET /flow-economics/gini`
- `GET /flow-economics/metrics/history`
- `PUT /flow-economics/pool-requests/:id/approve`
- `PUT /flow-economics/pool-requests/:id/reject`
- `POST /flow-economics/pool-requests/:id/distribute`

### Por Ownership

- `PUT /users/:id` - Solo el propio usuario o ADMIN

### Solo JWT (Sin roles específicos)

- `GET /consensus/moderation/pending`
- `GET /consensus/reputation`

---

## 🚫 Protección contra Ataques Comunes

### SQL Injection

✅ **Protegido por Prisma ORM**
- Todas las queries usan Prisma Client
- Queries parametrizadas automáticamente
- No se usa SQL raw sin sanitización

### XSS (Cross-Site Scripting)

✅ **Protección en múltiples capas**:
1. Validación de input con `class-validator`
2. Sanitización en frontend
3. Content Security Policy headers (con helmet)

### CSRF (Cross-Site Request Forgery)

✅ **Protegido por arquitectura**:
- API stateless con JWT
- No se usan cookies de sesión
- CORS configurado correctamente

### Brute Force

✅ **Protegido por rate limiting**:
- Login: 10 intentos/minuto
- Register: 5 intentos/minuto
- Respuesta 429 cuando se excede

### Mass Assignment

✅ **Protegido por DTOs**:
- Uso de DTOs explícitos en todos los endpoints
- `class-validator` valida tipos y formatos
- Whitelist de campos permitidos

---

## 🔍 Validación de Input

### DTOs con class-validator

Todos los endpoints POST/PUT/PATCH usan DTOs con validaciones:

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(2, 50)
  name: string;
}
```

### Validación automática

Configurado en `main.ts` con `ValidationPipe`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Elimina propiedades no definidas en DTO
    forbidNonWhitelisted: true,  // Lanza error si hay props extra
    transform: true,        // Transforma tipos automáticamente
  })
);
```

---

## 📝 Logging y Auditoría

### Audit Log

Sistema de auditoría implementado para tracking de acciones críticas:

```typescript
// Tabla: AuditLog
{
  id: string
  userId: string
  action: string      // Ej: "CREATE_COMMUNITY", "UPDATE_USER"
  entity: string      // Ej: "Community", "User"
  entityId: string
  oldValues: JSON
  newValues: JSON
  createdAt: DateTime
}
```

**Acceso**: Solo ADMIN puede ver logs (`GET /communities/audit-log`)

### Acciones Auditadas

- ✅ Creación de comunidades
- ✅ Actualización de usuarios
- ✅ Otorgamiento de créditos
- ✅ Aprobación de solicitudes de pool
- ✅ Moderación de contenido

---

## 🔑 Gestión de Secrets

### Variables de Entorno

Configuradas en `.env` (no versionado):

```bash
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Best Practices

- ❌ **NUNCA** commitear `.env` al repositorio
- ✅ Usar `.env.example` como template
- ✅ Rotar secrets periódicamente
- ✅ Usar secrets managers en producción (AWS Secrets Manager, etc.)

---

## 🌐 CORS Configuration

**Configuración actual** (development):

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

**⚠️ Para producción**:
- Especificar dominios exactos (no usar wildcards)
- Configurar `credentials: true` solo si es necesario
- Limitar métodos HTTP permitidos

---

## 🧪 Testing de Seguridad

### Tests Implementados

**Total de tests**: 214 tests (100% passing)

**Tests de seguridad específicos**:
- `roles.guard.spec.ts` - 9 tests
- `users.service.spec.ts` - 11 tests (ownership validation)
- `analytics.controller.spec.ts` - 13 tests (ADMIN guards)
- `flow-economics.controller.spec.ts` - 20 tests (ADMIN guards)

### Cobertura de Tests de Seguridad

- ✅ Validación de roles
- ✅ Ownership validation
- ✅ Guard composition
- ✅ Error handling (401, 403, 429)
- ✅ Edge cases (usuario inexistente, roles inválidos)

---

## 🚀 Deployment Security

### Producción Checklist

Antes de deployar a producción, verificar:

- [ ] JWT_SECRET fuerte y único (min 32 caracteres)
- [ ] DATABASE_URL con credenciales seguras
- [ ] CORS configurado con dominios específicos
- [ ] HTTPS habilitado (obligatorio)
- [ ] Rate limiting configurado apropiadamente
- [ ] Helmet configurado con security headers
- [ ] Logs configurados y monitoreados
- [ ] Backups automáticos de base de datos
- [ ] Secrets en secrets manager (no .env)
- [ ] Variables de entorno validadas

### Headers de Seguridad (Helmet)

Helmet añade los siguientes headers de seguridad:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## 📢 Reporting Vulnerabilities

### Proceso de Reporte

Si encuentras una vulnerabilidad de seguridad:

1. **NO** abras un issue público en GitHub
2. Envía un email a: [security@comunidadviva.com] (placeholder)
3. Incluye:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de mitigación (opcional)

### Tiempo de Respuesta

- **Confirmación inicial**: 48 horas
- **Evaluación**: 7 días
- **Fix y deployment**: 30 días (según severidad)

---

## 🔄 Roadmap de Seguridad

### Próximas Implementaciones

1. **Refresh Tokens**
   - Implementar refresh token rotation
   - Almacenar tokens en base de datos
   - Endpoint para renovar access tokens

2. **2FA (Two-Factor Authentication)**
   - TOTP con Google Authenticator
   - SMS backup (opcional)
   - Recovery codes

3. **Rate Limiting Avanzado**
   - Rate limiting por usuario (no solo IP)
   - Rate limiting dinámico basado en reputación
   - Whitelist de IPs confiables

4. **Security Monitoring**
   - Sentry para error tracking
   - Winston para structured logging
   - Alertas automáticas para intentos de brute force

5. **Password Policies**
   - Validación de contraseñas débiles
   - Historia de contraseñas
   - Expiración de contraseñas (opcional)

6. **API Key Management**
   - API keys para integraciones externas
   - Rate limiting por API key
   - Scopes y permisos granulares

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**Última actualización**: 2025-10-30
**Versión**: 2.3.0
