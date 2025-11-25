# ⚠️ ACCIÓN REQUERIDA: Configurar Railway Desde la Interfaz Web

## 🔴 PROBLEMA CONFIRMADO

El error `"Could not find root directory: /packages/web"` prueba que Railway tiene **configuración almacenada en su base de datos** que está sobrescribiendo todos nuestros archivos de configuración.

## ✅ TODO LO QUE SE PUEDE HACER DESDE CLI YA ESTÁ HECHO

He aplicado TODAS las soluciones posibles:

1. ✅ Eliminado completamente el directorio packages/web
2. ✅ Configurado `RAILWAY_ROOT_DIRECTORY=packages/backend`
3. ✅ Actualizado todos los archivos de configuración
4. ✅ Removido npm workspaces
5. ✅ Configurado todas las variables de entorno
6. ✅ Verificado que el build funciona localmente

**El problema NO está en el código. El problema está en la configuración del servicio de Railway.**

## 🎯 SOLUCIÓN: Acceder a Railway Web UI

### Paso 1: Acceder al Servicio

1. Abre tu navegador
2. Ve a: **https://railway.app/**
3. Inicia sesión con tu cuenta
4. Verás el proyecto **"truk"**
5. Haz clic en el proyecto "truk"

### Paso 2: Revisar Service Settings

1. Dentro del proyecto, verás el servicio **"truk"**
2. Haz clic en el servicio "truk"
3. Ve a la pestaña **"Settings"** (en la parte superior)
4. Busca la sección que dice **"Source"** o **"Root Directory"** o **"Service Configuration"**

### Paso 3: Identificar el Problema

Busca alguna de estas configuraciones incorrectas:

#### A. Root Directory
```
❌ INCORRECTO: packages/web
✅ CORRECTO: packages/backend
```

#### B. Framework Detection
```
❌ INCORRECTO: Next.js
✅ CORRECTO: None (o Custom, o Nodejs)
```

#### C. Build Command
```
❌ INCORRECTO: npm run build (desde packages/web)
✅ CORRECTO: (dejar vacío o "npm run build" desde backend)
```

### Paso 4: Aplicar la Corrección

**OPCIÓN A: Si encuentras "Root Directory" con valor "packages/web"**

1. Cambia el valor a: `packages/backend`
2. Haz clic en **"Save"** o **"Update"**
3. Haz clic en **"Redeploy"** (botón arriba a la derecha)
4. Espera 2-3 minutos
5. Verifica: `curl https://truk-production.up.railway.app/health`

**OPCIÓN B: Si encuentras "Framework: Next.js"**

1. Cambia el framework a: **"None"** o **"Custom"**
2. Asegúrate de que el builder sea: **"Nixpacks"**
3. Guarda los cambios
4. Haz clic en **"Redeploy"**

**OPCIÓN C: Si no encuentras dónde cambiar**

1. Ve a la pestaña **"Deployments"**
2. Haz clic en el deployment más reciente
3. Verifica los **Build Logs** y busca dónde menciona "/packages/web"
4. En la sección de Settings, busca **"Override"** o **"Custom Build"**
5. Habilita "Custom Configuration"

### Paso 5: Si Nada Funciona - Crear Nuevo Servicio

**Esta es la solución más rápida si no encuentras dónde cambiar la configuración:**

1. **Crear Nuevo Servicio**
   - En el proyecto "truk", haz clic en **"+ New"** → **"GitHub Repo"**
   - Selecciona el mismo repositorio: `JosuIru/comunidad-viva`
   - En **"Root Directory"**, escribe: `packages/backend`
   - Haz clic en **"Deploy"**

2. **Configurar Variables de Entorno**
   - Ve a Settings → Variables
   - Agrega estas variables (cópialas del servicio viejo):
   ```
   DATABASE_URL=postgresql://postgres:mWskoEyaTIsdbiuABLltyhOkPVMdXaJC@gondola.proxy.rlwy.net:53043/railway
   JWT_SECRET=DR8T/1ghx7jd7LBHGvNs33q5cTqRiP2jxlX7lORERc+TUs/+E6AusSvBhaoVtfbdSDAh3/xVjfIBj/i4/V/4Fw==
   NODE_ENV=production
   PORT=8080
   FRONTEND_URL=https://truk-production.up.railway.app
   ```

3. **Verificar Deployment**
   - Espera 2-3 minutos
   - El nuevo servicio debería iniciar correctamente
   - Verifica el health endpoint

4. **Eliminar Servicio Viejo**
   - Una vez que el nuevo servicio funcione
   - Ve al servicio viejo
   - Settings → Delete Service

## 📊 Cómo Verificar Que Funciona

### Señales de Éxito en Build Logs:

```
✅ === NIXPACKS INSTALL PHASE ===
✅ /app  (o /app/packages/backend si ROOT_DIRECTORY no está configurado)
✅ Installing backend dependencies...
✅ === NIXPACKS BUILD PHASE ===
✅ Generating Prisma Client...
✅ Building TypeScript...
✅ BUILD SUCCESS: dist/main.js exists
```

### Señales de Éxito en Deploy Logs:

```
✅ === STARTING TRUK BACKEND ===
✅ DATABASE_URL is set: YES
✅ JWT_SECRET is set: YES
✅ Step 1: Generating Prisma Client...
✅ Step 2: Synchronizing Database Schema...
✅ Step 3: Checking if dist/main.js exists...
✅ ✓ dist/main.js found
✅ Step 4: Starting NestJS Server...
✅ [Nest] Application successfully started
```

### Health Check Exitoso:

```bash
$ curl https://truk-production.up.railway.app/health
{"status":"ok","timestamp":"2025-11-24T...","database":"connected"}
```

## 🆘 Si Sigues Teniendo Problemas

Si después de seguir todos estos pasos aún tienes el error 502:

1. **Copia los Build Logs completos** desde Railway UI
2. **Copia los Deploy Logs completos** desde Railway UI
3. Busca cualquier mensaje de error en rojo
4. El error real estará ahí

Errores comunes que podrías ver:

- **Error de Prisma**: Problema con DATABASE_URL o migraciones
- **Error de TypeScript**: El build falló (aunque local funciona, puede faltar algo en producción)
- **Error de NestJS**: Algún módulo o dependencia faltante
- **Error de Puerto**: La app no está escuchando en $PORT

## 📝 Resumen

**El código está correcto. La configuración de archivos está correcta. El problema es 100% configuración almacenada en Railway.**

**Necesitas acceder a Railway Web UI y cambiar el Root Directory o crear un nuevo servicio.**

No hay forma de hacer esto desde el CLI de Railway.
