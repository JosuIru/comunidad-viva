# 🚀 Guía de Instalación Gráfica - Comunidad Viva

## 📋 Índice

1. [Requisitos Previos](#-requisitos-previos)
2. [Instalación Paso a Paso](#-instalación-paso-a-paso)
3. [Configuración de la Base de Datos](#-configuración-de-la-base-de-datos)
4. [Configuración del Backend](#%EF%B8%8F-configuración-del-backend)
5. [Configuración del Frontend](#-configuración-del-frontend)
6. [Primer Inicio](#-primer-inicio)
7. [Configuraciones Opcionales](#-configuraciones-opcionales)
8. [Solución de Problemas](#-solución-de-problemas)
9. [Scripts Útiles](#-scripts-útiles)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Necesario

| Software | Versión Mínima | Descarga |
|----------|---------------|----------|
| **Node.js** | v18.0.0+ | [nodejs.org](https://nodejs.org/) |
| **npm** | v9.0.0+ | (Incluido con Node.js) |
| **PostgreSQL** | v14.0+ | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | v2.0+ | [git-scm.com](https://git-scm.com/) |

### Verificar Instalaciones

Abre una terminal y ejecuta estos comandos para verificar:

```bash
# Verificar Node.js
node --version
# Esperado: v18.x.x o superior

# Verificar npm
npm --version
# Esperado: 9.x.x o superior

# Verificar PostgreSQL
psql --version
# Esperado: PostgreSQL 14.x o superior

# Verificar Git
git --version
# Esperado: git version 2.x.x
```

---

## 🔧 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio

```bash
# Navega a la carpeta donde quieres instalar
cd ~/proyectos

# Clona el repositorio
git clone https://github.com/tu-usuario/comunidad-viva.git

# Entra al directorio
cd comunidad-viva
```

**Vista Esperada:**
```
📁 comunidad-viva/
├── 📁 packages/
│   ├── 📁 backend/
│   └── 📁 web/
├── 📄 package.json
├── 📄 README.md
└── ...
```

### Paso 2: Instalar Dependencias

```bash
# Instalar dependencias en la raíz (workspace)
npm install

# Esto instalará automáticamente las dependencias de:
# - packages/backend
# - packages/web
```

**Tiempo estimado:** 2-5 minutos dependiendo de tu conexión a internet.

**Salida Esperada:**
```
added 1847 packages, and audited 1848 packages in 3m
found 0 vulnerabilities
```

---

## 🗄️ Configuración de la Base de Datos

### Paso 1: Iniciar PostgreSQL

#### En Linux/Mac:
```bash
# Iniciar servicio PostgreSQL
sudo systemctl start postgresql

# Verificar que esté corriendo
sudo systemctl status postgresql
```

#### En Windows:
```bash
# Buscar "Services" → PostgreSQL → Start
# O usar pgAdmin 4
```

### Paso 2: Crear la Base de Datos

```bash
# Conectar a PostgreSQL (usuario por defecto)
sudo -u postgres psql

# Dentro de psql, ejecutar:
CREATE DATABASE comunidad_viva;
CREATE USER comunidad WITH ENCRYPTED PASSWORD 'comunidad_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE comunidad_viva TO comunidad;

# Salir de psql
\q
```

**Vista en pgAdmin:**
```
📊 PostgreSQL 14
  └── 🗄️ Databases
      └── 📁 comunidad_viva (Nueva base de datos)
```

### Paso 3: Configurar Variables de Entorno

Navega al directorio del backend:

```bash
cd packages/backend
```

Crea el archivo `.env`:

```bash
# En Linux/Mac:
cp .env.example .env

# En Windows:
copy .env.example .env
```

Edita el archivo `.env` con tu editor favorito:

```bash
# Con nano:
nano .env

# Con VSCode:
code .env

# Con vim:
vim .env
```

**Contenido del archivo `.env`:**

```env
# ==========================================
# 🗄️ BASE DE DATOS
# ==========================================
DATABASE_URL="postgresql://comunidad:comunidad_secure_2024@localhost:5432/comunidad_viva"

# ==========================================
# 🔐 AUTENTICACIÓN
# ==========================================
JWT_SECRET="tu-secreto-super-seguro-cambiar-en-produccion"
JWT_EXPIRES_IN="7d"

# ==========================================
# 🌐 SERVIDOR
# ==========================================
PORT=4000
NODE_ENV=development

# ==========================================
# 📧 EMAIL (Opcional)
# ==========================================
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-contraseña-de-aplicación"
EMAIL_FROM="Comunidad Viva <noreply@comunidadviva.com>"

# ==========================================
# ☁️ AWS S3 (Opcional - para almacenamiento en la nube)
# ==========================================
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key-id
S3_SECRET_KEY=your-secret-access-key
S3_REGION=us-east-1

# ==========================================
# 🔗 URLs
# ==========================================
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# ==========================================
# 🔗 BLOCKCHAIN (Opcional)
# ==========================================
# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_SEMILLA_CONTRACT=0x...

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_SEMILLA_MINT=...

# ==========================================
# 📊 REDIS (Opcional - para caché)
# ==========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Paso 4: Ejecutar Migraciones de Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones (crear tablas en la base de datos)
DATABASE_URL="postgresql://comunidad:comunidad_secure_2024@localhost:5432/comunidad_viva" npx prisma migrate dev --name init

# Verificar que las tablas se crearon correctamente
npx prisma studio
```

**Salida Esperada:**
```
✅ Environment variables loaded from .env
✅ Prisma schema loaded from prisma/schema.prisma
✅ Datasource "db": PostgreSQL database "comunidad_viva"

✅ Applying migration `20241103_init`

✅ Generated Prisma Client
```

**Vista en Prisma Studio (http://localhost:5555):**
```
📊 Models:
  ├── User
  ├── Community
  ├── Post
  ├── Offer
  ├── Event
  ├── Need
  ├── CommunityProject
  ├── TimeBankTransaction
  └── ... (más de 30 modelos)
```

### Paso 5: Poblar la Base de Datos (Seed)

```bash
# Ejecutar el script de seed para crear datos de ejemplo
DATABASE_URL="postgresql://comunidad:comunidad_secure_2024@localhost:5432/comunidad_viva" npm run seed
```

**Salida Esperada:**
```
🌱 Starting database seed...

✅ Created system admin user
✅ Created 5 test communities
✅ Created 20 test users
✅ Created 50 posts
✅ Created 30 offers
✅ Created 15 events
✅ Created 10 needs
✅ Created 5 community projects

🎉 Database seeded successfully!
```

---

## ⚙️ Configuración del Backend

### Paso 1: Verificar Estructura

```bash
# Desde la raíz del proyecto
cd packages/backend

# Verificar estructura
ls -la
```

**Estructura Esperada:**
```
📁 packages/backend/
├── 📁 src/
│   ├── 📁 auth/              # Autenticación y autorización
│   ├── 📁 users/             # Gestión de usuarios
│   ├── 📁 communities/       # Comunidades
│   ├── 📁 posts/             # Red social
│   ├── 📁 offers/            # Ofertas y marketplace
│   ├── 📁 events/            # Eventos
│   ├── 📁 housing/           # Vivienda colaborativa
│   ├── 📁 mutual-aid/        # Ayuda mutua
│   ├── 📁 consensus/         # Gobernanza y consenso
│   ├── 📁 economy/           # Sistema económico
│   ├── 📁 engagement/        # Gamificación
│   ├── 📁 federation/        # Blockchain y bridge
│   └── 📄 main.ts            # Punto de entrada
├── 📁 prisma/
│   ├── 📄 schema.prisma      # Esquema de base de datos
│   └── 📄 seed.ts            # Datos de ejemplo
├── 📁 test/                  # Tests unitarios
├── 📄 .env                   # Variables de entorno
├── 📄 package.json
└── 📄 tsconfig.json
```

### Paso 2: Compilar el Backend

```bash
# Compilar TypeScript a JavaScript
npm run build
```

**Salida Esperada:**
```
> @truk/backend@1.0.0 build
> nest build

✅ Successfully compiled 127 files with TypeScript
```

---

## 🎨 Configuración del Frontend

### Paso 1: Navegar al Frontend

```bash
# Desde la raíz del proyecto
cd packages/web
```

### Paso 2: Crear Variables de Entorno

```bash
# Crear archivo .env.local
touch .env.local
```

Edita el archivo `.env.local`:

```env
# ==========================================
# 🔗 API BACKEND
# ==========================================
NEXT_PUBLIC_API_URL=http://localhost:4000

# ==========================================
# 🗺️ MAPAS (Opcional - para Leaflet/OpenStreetMap)
# ==========================================
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION=© OpenStreetMap contributors

# ==========================================
# 🔐 NEXTAUTH (Autenticación)
# ==========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-nextauth-super-seguro

# ==========================================
# 🌐 IDIOMAS SOPORTADOS
# ==========================================
NEXT_PUBLIC_LANGUAGES=es,eu,en,ca
NEXT_PUBLIC_DEFAULT_LANGUAGE=es
```

### Paso 3: Verificar Estructura del Frontend

```bash
ls -la src/
```

**Estructura Esperada:**
```
📁 packages/web/
├── 📁 src/
│   ├── 📁 components/        # Componentes reutilizables
│   │   ├── 📄 Feed.tsx
│   │   ├── 📄 Map.tsx
│   │   ├── 📄 Navbar.tsx
│   │   └── ...
│   ├── 📁 pages/            # Páginas de Next.js
│   │   ├── 📄 index.tsx     # Página principal
│   │   ├── 📁 auth/         # Login/Register
│   │   ├── 📁 communities/  # Comunidades
│   │   ├── 📁 offers/       # Ofertas
│   │   ├── 📁 events/       # Eventos
│   │   └── ...
│   ├── 📁 lib/              # Utilidades
│   ├── 📁 hooks/            # Custom hooks
│   ├── 📁 styles/           # Estilos globales
│   └── 📁 types/            # TypeScript types
├── 📁 public/               # Archivos estáticos
│   ├── 📄 favicon.ico
│   └── 📁 images/
├── 📁 messages/             # Traducciones i18n
│   ├── 📄 es.json          # Español
│   ├── 📄 eu.json          # Euskera
│   ├── 📄 en.json          # Inglés
│   └── 📄 ca.json          # Catalán
├── 📄 .env.local
├── 📄 package.json
├── 📄 next.config.js
├── 📄 tailwind.config.js
└── 📄 tsconfig.json
```

---

## 🎯 Primer Inicio

### Paso 1: Iniciar el Backend

En una terminal:

```bash
# Desde la raíz del proyecto
cd packages/backend

# Iniciar en modo desarrollo (con hot-reload)
npm run dev
```

**Salida Esperada:**
```
[Nest] 12345  - 11/03/2025, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/03/2025, 10:30:45 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 11/03/2025, 10:30:45 AM     LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] 12345  - 11/03/2025, 10:30:45 AM     LOG [InstanceLoader] AuthModule dependencies initialized
...
[Nest] 12345  - 11/03/2025, 10:30:46 AM     LOG [RoutesResolver] Mapped {/health, GET} route
[Nest] 12345  - 11/03/2025, 10:30:46 AM     LOG [RoutesResolver] Mapped {/auth/login, POST} route
[Nest] 12345  - 11/03/2025, 10:30:46 AM     LOG [RoutesResolver] Mapped {/auth/register, POST} route
...
[Nest] 12345  - 11/03/2025, 10:30:46 AM     LOG [NestApplication] Nest application successfully started
🚀 Backend running on: http://localhost:4000
📖 Swagger docs: http://localhost:4000/api/docs
```

**Verificar que funciona:**

Abre tu navegador y visita:

- **Health Check:** http://localhost:4000/health
- **Swagger API Docs:** http://localhost:4000/api/docs

### Paso 2: Iniciar el Frontend

En otra terminal (mantén la anterior abierta):

```bash
# Desde la raíz del proyecto
cd packages/web

# Iniciar en modo desarrollo
npm run dev
```

**Salida Esperada:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully in 2.5s (364 modules)
wait  - compiling / (client and server)...
event - compiled client and server successfully in 851 ms (427 modules)
```

**Verificar que funciona:**

Abre tu navegador y visita:

- **Aplicación:** http://localhost:3000

### Paso 3: Primer Login

```
📱 Vista del Navegador en http://localhost:3000

┌─────────────────────────────────────────────┐
│  🌱 COMUNIDAD VIVA                          │
│                                              │
│  Plataforma de Economía Colaborativa Local │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │  Email:  test@consensus.local       │    │
│  ├────────────────────────────────────┤    │
│  │  Password: ••••••••                │    │
│  └────────────────────────────────────┘    │
│                                              │
│       [ Iniciar Sesión ]                    │
│                                              │
│       ¿No tienes cuenta? Regístrate         │
└─────────────────────────────────────────────┘
```

**Usuarios de Prueba (creados por el seed):**

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `test@consensus.local` | `test123` | Ciudadano |
| `admin@system.local` | `admin123` | Administrador |
| `maria@comunidad.local` | `test123` | Ciudadano |
| `juan@comunidad.local` | `test123` | Ciudadano |

### Paso 4: Explorar la Aplicación

Una vez iniciada sesión, verás:

```
┌────────────────────────────────────────────────┐
│ 🌱 Comunidad Viva        🔔 👤 Juan Pérez     │
├────────────────────────────────────────────────┤
│                                                 │
│  🏠 Feed  |  🤝 Ayuda Mutua  |  🏠 Vivienda   │
│  💼 Ofertas  |  📅 Eventos  |  🏛️ Gobernanza │
│                                                 │
├────────────────────────────────────────────────┤
│  📊 Dashboard                                   │
│  ┌──────────────┬──────────────┬─────────────┐│
│  │ 💰 Credits   │ ⏰ Time Hours│ 🎖️ Badges   ││
│  │    250       │     12.5     │      8      ││
│  └──────────────┴──────────────┴─────────────┘│
│                                                 │
│  📰 Últimas Publicaciones                      │
│  ┌───────────────────────────────────────────┐│
│  │ 👤 María García                           ││
│  │ 🕐 Hace 2 horas                          ││
│  │                                           ││
│  │ "Necesito ayuda con mudanza este sábado" ││
│  │                                           ││
│  │ 👍 15  💬 3  🔄 2                         ││
│  └───────────────────────────────────────────┘│
│                                                 │
│  🆕 Nueva Necesidad  |  📝 Publicar           │
└────────────────────────────────────────────────┘
```

---

## 🔧 Configuraciones Opcionales

### 1. Configurar Email (Notificaciones)

#### Gmail

1. Habilita "Verificación en 2 pasos" en tu cuenta de Gmail
2. Genera una "Contraseña de aplicación": https://myaccount.google.com/apppasswords
3. Añade en tu `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
```

#### Prueba el email:

```bash
curl -X POST http://localhost:4000/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "tu-email@ejemplo.com", "subject": "Test", "text": "Funciona!"}'
```

### 2. Configurar AWS S3 (Almacenamiento de Imágenes)

Ver sección detallada en el [README.md](packages/backend/README.md#%EF%B8%8F-configuración-de-almacenamiento-s3)

**Resumen rápido:**

1. Crear bucket en AWS S3
2. Crear credenciales IAM con permisos S3
3. Configurar en `.env`:

```env
S3_BUCKET=tu-bucket-name
S3_ACCESS_KEY=tu-access-key
S3_SECRET_KEY=tu-secret-key
S3_REGION=us-east-1
```

4. Verificar: http://localhost:4000/upload/storage-info

### 3. Configurar Redis (Caché - Opcional)

#### Instalar Redis:

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Mac
brew install redis

# Iniciar servicio
sudo systemctl start redis
# o
redis-server
```

**Windows:**
```bash
# Descargar desde: https://redis.io/download
# O usar Docker:
docker run -d -p 6379:6379 redis
```

#### Configurar en `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 4. Configurar Blockchain (Polygon/Solana)

Para habilitar el bridge blockchain:

```env
# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_SEMILLA_CONTRACT=0x... # Tu contrato desplegado

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_SEMILLA_MINT=... # Tu token mint
```

---

## 🔍 Solución de Problemas

### Problema 1: Puerto ya en uso

**Error:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solución:**
```bash
# Encontrar y matar el proceso que usa el puerto 4000
lsof -ti:4000 | xargs kill -9

# O cambiar el puerto en .env
PORT=4001
```

### Problema 2: Error de conexión a PostgreSQL

**Error:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solución:**
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Iniciar si está detenido
sudo systemctl start postgresql

# Verificar credenciales en .env
DATABASE_URL="postgresql://usuario:password@localhost:5432/database"
```

### Problema 3: Prisma migrate falla

**Error:**
```
Error: P3009: Prisma Migrate could not create the shadow database
```

**Solución:**
```bash
# Dar permisos adicionales al usuario
sudo -u postgres psql
GRANT CREATE ON SCHEMA public TO comunidad;
ALTER USER comunidad CREATEDB;
\q

# Reintentar migración
npx prisma migrate dev
```

### Problema 4: Frontend no conecta con Backend

**Error en consola del navegador:**
```
Failed to fetch: Network error
```

**Solución:**

1. Verificar que el backend esté corriendo:
```bash
curl http://localhost:4000/health
```

2. Verificar `.env.local` del frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Verificar CORS en el backend (`main.ts`):
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Problema 5: Error en npm install

**Error:**
```
npm ERR! code ENOENT
npm ERR! syscall spawn git
```

**Solución:**
```bash
# Limpiar caché de npm
npm cache clean --force

# Borrar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema 6: TypeScript errors en el build

**Error:**
```
TS2307: Cannot find module '@nestjs/common'
```

**Solución:**
```bash
# Regenerar tipos de TypeScript
npm run prisma:generate

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Scripts Útiles

### Scripts del Backend

```bash
cd packages/backend

# Desarrollo
npm run dev              # Iniciar con hot-reload
npm run start            # Iniciar en modo producción
npm run build            # Compilar TypeScript

# Base de Datos
npm run migrate          # Ejecutar migraciones en producción
npm run migrate:dev      # Ejecutar migraciones en desarrollo
npm run seed             # Poblar con datos de ejemplo
npm run prisma:generate  # Regenerar cliente Prisma
npm run prisma:studio    # Abrir Prisma Studio (GUI)

# Testing
npm test                 # Ejecutar todos los tests
npm run test:watch       # Tests en modo watch
npm run test:cov         # Tests con cobertura

# Linting
npm run lint             # Verificar código
npm run lint:fix         # Auto-corregir problemas
```

### Scripts del Frontend

```bash
cd packages/web

# Desarrollo
npm run dev              # Iniciar en modo desarrollo
npm run build            # Build para producción
npm run start            # Iniciar build de producción
npm run lint             # Verificar código

# Testing
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
```

### Scripts desde la Raíz

```bash
# Desde comunidad-viva/

# Iniciar todo (backend + frontend)
npm run dev

# Iniciar solo backend
npm run dev:backend

# Iniciar solo frontend
npm run dev:web

# Build todo
npm run build

# Tests de todo
npm run test

# Lint de todo
npm run lint
```

---

## 🎉 ¡Instalación Completada!

Si has llegado hasta aquí, deberías tener:

✅ PostgreSQL configurado y corriendo
✅ Backend corriendo en http://localhost:4000
✅ Frontend corriendo en http://localhost:3000
✅ Base de datos poblada con datos de ejemplo
✅ Usuario de prueba funcional

### Próximos Pasos

1. **Explorar la Aplicación:**
   - Login con `test@consensus.local` / `test123`
   - Navega por todas las secciones
   - Crea una publicación, oferta o evento

2. **Revisar la Documentación:**
   - [README Principal](README.md)
   - [API de Vivienda](packages/backend/HOUSING_API.md)
   - [API de Ayuda Mutua](packages/backend/MUTUAL_AID_API.md)
   - [Swagger Docs](http://localhost:4000/api/docs)

3. **Unirse a la Comunidad:**
   - Reportar bugs o sugerencias
   - Contribuir código
   - Compartir tu experiencia

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa esta guía** y la sección de [Solución de Problemas](#-solución-de-problemas)
2. **Consulta los logs:**
   ```bash
   # Backend logs
   cd packages/backend
   tail -f logs/combined.log

   # Frontend logs
   # Aparecen en la terminal donde ejecutaste npm run dev
   ```
3. **Crea un issue** en GitHub con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Tu sistema operativo y versiones

---

## 🌟 Contribuir

¿Quieres mejorar esta guía?

1. Fork el proyecto
2. Edita `GUIA_INSTALACION.md`
3. Crea un Pull Request

---

## 📜 Licencia

MIT License - El conocimiento y las herramientas de transformación social deben ser libres.

---

> "La tecnología al servicio de la vida, no del lucro."
>
> "Cuando todos prosperan, yo prospero. Cuando ayudo, me ayudo."
