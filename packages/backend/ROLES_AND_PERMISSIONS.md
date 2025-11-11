# Sistema de Roles y Permisos

Este documento describe el sistema de autorización basado en roles implementado en Truk.

## Tabla de Contenidos

1. [Roles Disponibles](#roles-disponibles)
2. [Arquitectura](#arquitectura)
3. [Uso](#uso)
4. [Ejemplos](#ejemplos)
5. [Testing](#testing)
6. [Mejores Prácticas](#mejores-prácticas)

---

## Roles Disponibles

El sistema define tres roles principales en `@prisma/client`:

### `UserRole.CITIZEN`
- **Descripción**: Usuario estándar de la plataforma
- **Permisos**: Acceso a funcionalidades básicas
- **Casos de uso**:
  - Participar en eventos
  - Crear/buscar ofertas
  - Usar banco de tiempo
  - Participar en compras grupales

### `UserRole.MERCHANT`
- **Descripción**: Comerciante o vendedor local
- **Permisos**: Todo lo de CITIZEN más funcionalidades de comercio
- **Casos de uso**:
  - Crear ofertas comerciales
  - Gestionar inventario
  - Recibir pagos en créditos

### `UserRole.ADMIN`
- **Descripción**: Administrador del sistema
- **Permisos**: Acceso completo a funcionalidades administrativas
- **Casos de uso**:
  - Otorgar créditos manualmente
  - Ver logs de auditoría
  - Gestionar usuarios
  - Moderar contenido

---

## Arquitectura

### Componentes Principales

#### 1. `@Roles()` Decorator
**Ubicación**: `src/auth/decorators/roles.decorator.ts`

```typescript
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

**Propósito**: Marca endpoints con los roles requeridos para acceder.

#### 2. `RolesGuard`
**Ubicación**: `src/auth/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Valida que el usuario tenga uno de los roles requeridos
  }
}
```

**Propósito**: Guard que verifica los roles del usuario contra los requeridos.

**Comportamiento**:
- ✅ Si no hay roles requeridos → permite acceso
- ✅ Si el usuario tiene uno de los roles requeridos → permite acceso
- ❌ Si el usuario no tiene ningún rol requerido → lanza `ForbiddenException`
- ❌ Si el usuario no está autenticado → lanza `ForbiddenException`

---

## Uso

### 1. Proteger un Endpoint

Para proteger un endpoint, usa tanto `JwtAuthGuard` como `RolesGuard`:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Post('admin-only')
async adminOnlyEndpoint() {
  // Solo usuarios con rol ADMIN pueden acceder
}
```

### 2. Múltiples Roles

Puedes especificar múltiples roles. El usuario solo necesita **uno** de ellos:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MERCHANT)
@Post('for-admins-or-merchants')
async mixedAccess() {
  // Accesible por ADMIN O MERCHANT
}
```

### 3. Solo Autenticación (Sin Roles Específicos)

Si solo necesitas autenticación sin verificar roles:

```typescript
@UseGuards(JwtAuthGuard)
@Get('authenticated-only')
async anyAuthenticatedUser() {
  // Cualquier usuario autenticado puede acceder
}
```

---

## Ejemplos

### Ejemplo 1: Otorgar Créditos (Admin Only)

**Archivo**: `src/credits/credits.controller.ts`

```typescript
@ApiOperation({ summary: 'Grant credits to user (admin only)' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Post('grant')
async grantCredits(@Request() req, @Body() grantCreditsDto: GrantCreditsDto) {
  return this.creditsService.grantCredits(
    grantCreditsDto.userId,
    grantCreditsDto.amount,
    grantCreditsDto.reason,
    grantCreditsDto.relatedId,
    grantCreditsDto.description,
  );
}
```

**Resultado**:
- ✅ Usuario con rol `ADMIN` → puede otorgar créditos
- ❌ Usuario con rol `CITIZEN` o `MERCHANT` → `403 Forbidden`
- ❌ Usuario no autenticado → `401 Unauthorized`

### Ejemplo 2: Logs de Auditoría (Admin Only)

**Archivo**: `src/communities/communities.controller.ts`

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('audit-log')
getAuditLog(@Query() filters: AuditLogFilters) {
  return this.communitiesService.getAuditLog(filters);
}
```

**Por qué protegerlo**:
- Los logs de auditoría contienen información sensible
- Solo administradores deben ver actividad del sistema
- Previene acceso no autorizado a datos de usuarios

### Ejemplo 3: Crear Oferta Comercial (Merchant o Admin)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MERCHANT, UserRole.ADMIN)
@Post('commercial-offers')
async createCommercialOffer(@Body() dto: CreateOfferDto) {
  return this.offersService.createCommercial(dto);
}
```

---

## Testing

### Test del RolesGuard

**Ubicación**: `src/auth/guards/roles.guard.spec.ts`

```typescript
describe('RolesGuard', () => {
  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    const context = createMockExecutionContext({
      role: UserRole.ADMIN
    });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    const context = createMockExecutionContext({
      role: UserRole.CITIZEN
    });

    expect(() => guard.canActivate(context))
      .toThrow(ForbiddenException);
  });
});
```

### Test de Endpoints Protegidos

Al probar endpoints protegidos, asegúrate de mockear el usuario con el rol correcto:

```typescript
it('should call admin endpoint successfully', async () => {
  const mockUser = {
    userId: 'admin-123',
    role: UserRole.ADMIN,
    email: 'admin@test.com',
  };

  const req = { user: mockUser };

  // Tu test aquí
});
```

---

## Mejores Prácticas

### 1. ⚠️ Siempre Usa JwtAuthGuard Primero

```typescript
// ✅ CORRECTO
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)

// ❌ INCORRECTO - RolesGuard no tendrá acceso al usuario
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
```

**Razón**: `JwtAuthGuard` carga el usuario en el request. `RolesGuard` necesita ese usuario para verificar roles.

### 2. 📝 Documenta Endpoints Protegidos

Usa decoradores de Swagger para documentar requisitos de roles:

```typescript
@ApiOperation({
  summary: 'Grant credits (Admin only)',
  description: 'Requires ADMIN role to grant credits to users'
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

### 3. 🔒 Endpoints Sensibles Siempre con Guards

Cualquier endpoint que:
- Modifica datos de otros usuarios
- Accede a información sensible
- Ejecuta acciones administrativas
- Ve logs o métricas del sistema

**Debe estar protegido con guards apropiados.**

### 4. 🧪 Testea Permisos

Crea tests que verifiquen:
- ✅ Usuario con rol correcto puede acceder
- ❌ Usuario sin rol correcto recibe 403
- ❌ Usuario no autenticado recibe 401

```typescript
describe('Admin Endpoint', () => {
  it('should allow ADMIN', async () => {
    // Test with ADMIN role
  });

  it('should deny CITIZEN', async () => {
    // Test with CITIZEN role - expect 403
  });

  it('should deny unauthenticated', async () => {
    // Test without JWT - expect 401
  });
});
```

### 5. 🎯 Principio de Menor Privilegio

- No uses `ADMIN` para endpoints que pueden usar `MERCHANT`
- Crea roles específicos si es necesario
- Revisa periódicamente qué endpoints tienen qué permisos

### 6. 🔄 Validación en Múltiples Capas

Aunque uses guards, también valida en el servicio:

```typescript
// Controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Post('grant')
async grantCredits(@Body() dto: GrantCreditsDto) {
  return this.creditsService.grantCredits(dto);
}

// Service
async grantCredits(dto: GrantCreditsDto) {
  // Validación adicional en servicio
  if (!this.isValidAmount(dto.amount)) {
    throw new BadRequestException('Invalid amount');
  }
  // ...
}
```

---

## Endpoints Protegidos Actualmente

### Credits (`/credits`)
| Endpoint | Método | Roles Requeridos | Descripción |
|----------|--------|------------------|-------------|
| `/grant` | POST | `ADMIN` | Otorgar créditos a usuarios |

### Communities (`/communities`)
| Endpoint | Método | Roles Requeridos | Descripción |
|----------|--------|------------------|-------------|
| `/audit-log` | GET | `ADMIN` | Ver logs de auditoría del sistema |

### Viral Features (`/viral-features`)
| Endpoint | Método | Roles Requeridos | Descripción |
|----------|--------|------------------|-------------|
| `/admin/create-flash-deals` | POST | `ADMIN` | Crear flash deals manualmente |
| `/admin/activate-happy-hour` | POST | `ADMIN` | Activar happy hour manualmente |
| `/admin/create-weekly-challenge` | POST | `ADMIN` | Crear desafío semanal |
| `/admin/clean-expired-stories` | POST | `ADMIN` | Limpiar historias expiradas |
| `/admin/reset-daily-actions` | POST | `ADMIN` | Reset acciones diarias (mantenimiento) |
| `/admin/update-streaks` | POST | `ADMIN` | Actualizar rachas activas |

### Analytics (`/analytics`)
| Endpoint | Método | Roles Requeridos | Descripción |
|----------|--------|------------------|-------------|
| `/community/metrics` | GET | `ADMIN` | Ver métricas de impacto comunitario |
| `/timeseries` | GET | `ADMIN` | Ver métricas de series temporales |
| `/export/csv` | GET | `ADMIN` | Exportar métricas como CSV |

### Flow Economics (`/flow-economics`)
| Endpoint | Método | Roles Requeridos | Descripción |
|----------|--------|------------------|-------------|
| `/metrics` | GET | `ADMIN` | Ver métricas económicas del sistema |
| `/gini` | GET | `ADMIN` | Ver índice Gini (medida de igualdad) |
| `/metrics/history` | GET | `ADMIN` | Ver métricas económicas históricas |
| `/pool-requests/:id/approve` | PUT | `ADMIN` | Aprobar solicitud de pool |
| `/pool-requests/:id/reject` | PUT | `ADMIN` | Rechazar solicitud de pool |
| `/pool-requests/:id/distribute` | POST | `ADMIN` | Distribuir fondos de pool aprobado |

### Users (`/users`)
| Endpoint | Método | Validación Especial | Descripción |
|----------|--------|---------------------|-------------|
| `/:id` | PUT | Ownership/ADMIN | Solo puedes actualizar tu propio perfil, o ser ADMIN |

### Consensus (`/consensus`)
| Endpoint | Método | Roles Requeridos | Descripción |
|----------|--------|------------------|-------------|
| `/moderation/pending` | GET | `JWT Auth` | Ver solicitudes de moderación pendientes |
| `/reputation` | GET | `JWT Auth` | Ver tu propia reputación |

---

## Roadmap

### Mejoras Futuras

1. **Roles Granulares**
   - `MODERATOR`: Para moderar contenido sin acceso completo
   - `COMMUNITY_ADMIN`: Admin a nivel de comunidad específica

2. **Permisos Basados en Recursos**
   - Verificar ownership de recursos
   - Permisos contextuales (ej: fundador de comunidad)

3. **Rate Limiting por Rol**
   - Límites diferentes según rol del usuario

4. **Logging de Acceso**
   - Auditoría automática de accesos a endpoints protegidos

---

## Troubleshooting

### Error: "User not authenticated"

**Causa**: El guard no encuentra el objeto `user` en el request.

**Solución**:
1. Verifica que `JwtAuthGuard` está antes de `RolesGuard`
2. Asegúrate de que el JWT es válido
3. Verifica que la estrategia JWT está configurada correctamente

### Error: "Access denied. Required roles: ADMIN"

**Causa**: El usuario autenticado no tiene el rol requerido.

**Solución**:
1. Verifica el rol del usuario en la base de datos
2. Asegúrate de que el JWT incluye el campo `role`
3. Para testing, usa un usuario mock con el rol correcto

### El guard no se ejecuta

**Causa**: El decorador `@UseGuards()` puede estar mal colocado.

**Solución**:
1. Coloca `@UseGuards()` directamente sobre el método handler
2. O sobre la clase del controller para aplicarlo a todos los métodos
3. Verifica que los guards están importados correctamente

---

## Contacto y Contribuciones

Para preguntas o sugerencias sobre el sistema de roles:
- Crea un issue en GitHub
- Consulta con el equipo de backend
- Revisa los tests en `src/auth/guards/roles.guard.spec.ts`

---

**Última actualización**: 2025-10-30
**Versión**: 1.0.0
