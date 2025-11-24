# Problemas de Deployment en Railway - Diagnóstico y Soluciones

## Resumen del Problema

El proyecto no inicia en Railway. El servicio devuelve error HTTP 502 con el mensaje:
```json
{"status":"error","code":502,"message":"Application failed to respond"}
```

## Evidencia del Problema Original

Los logs iniciales mostraban que Railway estaba ejecutando el paquete **web** (Next.js) en lugar del **backend** (NestJS):

```
> @truk/web@1.0.0 start
> next start

Error: ENOENT: no such file or directory, open '/app/.next/prerender-manifest.json'
```

## Configuraciones Aplicadas

### 1. `.railwayignore`
Actualizado para ignorar paquetes no necesarios:
```
packages/web
packages/blockchain
packages/shared
```

### 2. `railway.json`
Configurado para usar scripts del backend:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "bash build.sh",
    "watchPatterns": ["packages/backend/**"]
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### 3. `nixpacks.toml`
Ya existía configuración correcta para el backend:
```toml
[phases.install]
cmds = ["cd packages/backend", "npm install"]

[phases.build]
cmds = ["cd packages/backend", "npx prisma generate", "npm run build"]

[start]
cmd = "cd packages/backend && bash start.sh"
```

### 4. `package.json` raíz
- Removido el campo `workspaces` para evitar que Railway detecte múltiples paquetes
- Agregado script `start` que apunta al backend
- Renombrado a `truk-backend` para mayor claridad

### 5. Variables de entorno Railway
- `NIXPACKS_NO_CACHE=1` - Para forzar rebuild sin caché
- `NIXPACKS_PATH=packages/backend` - Intento de especificar el path (puede no funcionar)
- `NODE_ENV=production`

## Problema Actual

A pesar de todas las configuraciones, el servicio sigue sin responder. El Railway CLI no puede mostrar los logs:
```
Failed to retrieve build log
```

Esto impide diagnosticar exactamente qué está fallando durante el build o el inicio.

## Posibles Causas

1. **Railway tiene configuración almacenada**: El servicio puede haber guardado la configuración de Next.js y está ignorando los archivos de configuración

2. **Problema con la estructura de monorepo**: Railway puede estar confundiéndose con la estructura de packages/

3. **Error en el build del backend**: Es posible que el build esté fallando pero no podemos ver los logs

4. **Problema con Prisma**: La migración de base de datos o generación de Prisma Client puede estar fallando

5. **Variables de entorno faltantes**: Pueden faltar variables de entorno críticas como JWT_SECRET, SOLANA_PRIVATE_KEY, etc.

## Próximos Pasos Recomendados

### Opción 1: Acceder a la Interfaz Web de Railway (RECOMENDADO)

1. Ir a https://railway.app/
2. Navegar al proyecto "truk"
3. Revisar los logs de build y deployment en la interfaz web
4. Verificar qué comando está ejecutando Railway realmente
5. Revisar si faltan variables de entorno

### Opción 2: Verificar Variables de Entorno

Asegurarse de que todas las variables necesarias estén configuradas:
```bash
railway variables
```

Variables críticas que deberían estar presentes:
- `DATABASE_URL` ✓ (ya configurada)
- `JWT_SECRET`
- `SOLANA_PRIVATE_KEY` o `SOLANA_MNEMONIC`
- `SOLANA_NETWORK`
- `PORT` (opcional, Railway suele configurarla automáticamente)

### Opción 3: Simplificar la Estructura

Considerar crear un nuevo servicio de Railway que apunte directamente a `packages/backend` como root:

1. Crear nuevo servicio en Railway
2. Configurar el servicio para usar `packages/backend` como directorio raíz
3. Usar el `package.json` y configuración de `packages/backend` directamente

### Opción 4: Verificar el Build Localmente

Antes de deployar, verificar que el build funciona localmente:
```bash
cd /home/josu/truk
bash build.sh
cd packages/backend
bash start.sh
```

## Archivos Modificados

1. `.railwayignore` - Agregado exclusiones
2. `railway.json` - Configurado buildCommand y startCommand
3. `nixpacks.toml` - Agregado logging y dependsOn
4. `package.json` (raíz) - Removido workspaces, agregado start script
5. Variables de entorno en Railway

## URLs Útiles

- Build Logs (última ejecución): https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5/service/28b267e1-e4d0-4efe-b5ab-42d20e7beb15?id=cc3ddf86-1cc0-4bc9-a4fc-2cf49d077567
- Endpoint público: https://truk-production.up.railway.app
- Health check: https://truk-production.up.railway.app/health (actualmente retorna 502)

## Conclusión

El problema principal era que Railway estaba detectando y ejecutando el paquete `web` en lugar del `backend`. Se han aplicado múltiples configuraciones para forzar el uso del backend, pero el servicio sigue sin responder.

**Es necesario acceder a la interfaz web de Railway para ver los logs de build** y determinar exactamente qué está fallando. El Railway CLI no está mostrando los logs correctamente desde la terminal.
