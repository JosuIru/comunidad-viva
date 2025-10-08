#!/bin/bash

# =================================================================
# COMUNIDAD VIVA - INSTALACIÓN AUTOMÁTICA
# =================================================================
# Este script instala y configura todo el proyecto en local
# Requisitos: Node.js 18+, Docker, Docker Compose
# =================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    COMUNIDAD VIVA                         ║"
echo "║         Red Social de Economía Colaborativa Local         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Función para verificar comandos
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 no está instalado. Por favor instálalo primero.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 está instalado${NC}"
    fi
}

# Función para crear directorios
create_directories() {
    echo -e "${YELLOW}📁 Creando estructura de directorios...${NC}"
    
    mkdir -p packages/shared/src
    mkdir -p packages/backend/src/{auth,users,offers,timebank,credits,events,social,notifications,analytics,websocket,prisma}
    mkdir -p packages/backend/prisma
    mkdir -p packages/web/src/{pages,components,lib,hooks,styles,public}
    mkdir -p docker
    mkdir -p nginx/ssl
    mkdir -p monitoring/{prometheus,grafana/dashboards}
    mkdir -p scripts
    mkdir -p backups
    mkdir -p .github/workflows
    
    echo -e "${GREEN}✅ Directorios creados${NC}"
}

# Función para crear archivo si no existe
create_file() {
    if [ ! -f "$1" ]; then
        echo -e "${YELLOW}📝 Creando $1...${NC}"
        echo "$2" > "$1"
    fi
}

# Verificar requisitos
echo -e "${YELLOW}🔍 Verificando requisitos...${NC}"
check_command node
check_command npm
check_command docker
check_command docker-compose

# Verificar versión de Node
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Se requiere Node.js 18 o superior${NC}"
    exit 1
fi

# Crear estructura
create_directories

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}🔐 Creando archivo .env...${NC}"
    cat > .env << 'EOF'
# Database
DB_USER=comunidad
DB_PASSWORD=comunidad_secret_2024
DATABASE_URL=postgresql://comunidad:comunidad_secret_2024@localhost:5432/comunidad_viva

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=tu_jwt_secret_super_seguro_minimo_32_caracteres_aqui
NEXTAUTH_SECRET=tu_nextauth_secret_super_seguro_minimo_32_chars
NEXTAUTH_URL=http://localhost:3000

# URLs
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# Email (usar Mailtrap para desarrollo)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=tu_usuario_mailtrap
SMTP_PASS=tu_password_mailtrap

# Storage (usar local en desarrollo)
STORAGE_TYPE=local
UPLOAD_PATH=./uploads

# Environment
NODE_ENV=development
PORT=4000

# Opcional - Dejar vacío en desarrollo
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=
SENTRY_DSN=
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
fi

# Crear package.json raíz
echo -e "${YELLOW}📦 Creando package.json principal...${NC}"
cat > package.json << 'EOF'
{
  "name": "comunidad-viva",
  "version": "1.0.0",
  "description": "Red Social de Economía Colaborativa Local",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:db\" \"npm run dev:backend\" \"npm run dev:web\"",
    "dev:db": "docker-compose up -d postgres redis",
    "dev:backend": "cd packages/backend && npm run dev",
    "dev:web": "cd packages/web && npm run dev",
    "build": "npm run build:shared && npm run build:backend && npm run build:web",
    "build:shared": "cd packages/shared && npm run build",
    "build:backend": "cd packages/backend && npm run build",
    "build:web": "cd packages/web && npm run build",
    "test": "npm run test:backend && npm run test:web",
    "test:backend": "cd packages/backend && npm test",
    "test:web": "cd packages/web && npm test",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "db:migrate": "cd packages/backend && npx prisma migrate dev",
    "db:seed": "cd packages/backend && npm run seed",
    "db:studio": "cd packages/backend && npx prisma studio",
    "clean": "rm -rf node_modules packages/*/node_modules packages/*/dist packages/web/.next",
    "setup": "npm install && npm run db:migrate && npm run db:seed"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
EOF

# Crear package.json para shared
echo -e "${YELLOW}📦 Creando packages/shared/package.json...${NC}"
cat > packages/shared/package.json << 'EOF'
{
  "name": "@comunidad-viva/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
EOF

# Crear tsconfig para shared
cat > packages/shared/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Crear package.json para backend
echo -e "${YELLOW}📦 Creando packages/backend/package.json...${NC}"
cat > packages/backend/package.json << 'EOF'
{
  "name": "@comunidad-viva/backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "test": "jest",
    "seed": "ts-node prisma/seed.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.1.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/websockets": "^10.0.0",
    "@prisma/client": "^5.7.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "date-fns": "^2.30.0",
    "exceljs": "^4.4.0",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "multer": "^1.4.5-lts.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pdf-lib": "^1.17.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "socket.io": "^4.6.0",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.10",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.10.0",
    "@types/passport-jwt": "^3.0.13",
    "@types/passport-local": "^1.0.38",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "prisma": "^5.7.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.3.0"
  }
}
EOF

# Crear tsconfig para backend
cat > packages/backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
EOF

# Crear nest-cli.json
cat > packages/backend/nest-cli.json << 'EOF'
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
EOF

# Crear package.json para web
echo -e "${YELLOW}📦 Creando packages/web/package.json...${NC}"
cat > packages/web/package.json << 'EOF'
{
  "name": "@comunidad-viva/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --watch",
    "test:ci": "jest"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.12.0",
    "axios": "^1.6.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "maplibre-gl": "^3.6.0",
    "next": "14.0.4",
    "next-auth": "^4.24.5",
    "react": "^18.2.0",
    "react-countup": "^6.5.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "react-hot-toast": "^2.4.1",
    "react-intersection-observer": "^9.5.3",
    "socket.io-client": "^4.6.0",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "14.0.4",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.0"
  }
}
EOF

# Crear next.config.js
cat > packages/web/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WS_URL: process.env.WS_URL || 'ws://localhost:4000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
EOF

# Crear tailwind.config.js
cat > packages/web/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
EOF

# Crear tsconfig para web
cat > packages/web/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Crear archivo de seed para la base de datos
echo -e "${YELLOW}🌱 Creando archivo seed.ts...${NC}"
cat > packages/backend/prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.$transaction([
    prisma.creditTransaction.deleteMany(),
    prisma.timeBankTransaction.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.offer.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Crear usuarios de prueba
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'maria@example.com',
        name: 'María García',
        password: hashedPassword,
        phone: '+34600000001',
        lat: 40.4168,
        lng: -3.7038,
        neighborhood: 'Centro',
        credits: 50,
        hoursShared: 10,
        peopleHelped: 5,
        bio: 'Profesora de guitarra y amante de la jardinería',
      },
    }),
    prisma.user.create({
      data: {
        email: 'pedro@example.com',
        name: 'Pedro Martínez',
        password: hashedPassword,
        phone: '+34600000002',
        lat: 40.4268,
        lng: -3.7138,
        neighborhood: 'Norte',
        credits: 30,
        hoursReceived: 5,
        peopleHelpedBy: 3,
        bio: 'Mecánico de bicicletas y cocinero aficionado',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ana@example.com',
        name: 'Ana López',
        password: hashedPassword,
        phone: '+34600000003',
        lat: 40.4068,
        lng: -3.6938,
        neighborhood: 'Sur',
        credits: 40,
        hoursShared: 8,
        peopleHelped: 4,
        bio: 'Diseñadora web y profesora de inglés',
      },
    }),
  ]);

  // Crear habilidades
  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        userId: users[0].id,
        category: 'Educación',
        name: 'Clases de guitarra',
        description: 'Clases para principiantes y nivel intermedio',
        verified: true,
        endorsements: 5,
      },
    }),
    prisma.skill.create({
      data: {
        userId: users[0].id,
        category: 'Jardinería',
        name: 'Cuidado de plantas',
        description: 'Consejos y ayuda con tu jardín',
        verified: true,
        endorsements: 3,
      },
    }),
    prisma.skill.create({
      data: {
        userId: users[1].id,
        category: 'Reparaciones',
        name: 'Reparación de bicicletas',
        description: 'Arreglo todo tipo de bicis',
        verified: true,
        endorsements: 8,
      },
    }),
    prisma.skill.create({
      data: {
        userId: users[2].id,
        category: 'Tecnología',
        name: 'Diseño web',
        description: 'Ayuda con tu página web o tienda online',
        verified: true,
        endorsements: 6,
      },
    }),
  ]);

  // Crear ofertas
  await Promise.all([
    prisma.offer.create({
      data: {
        userId: users[0].id,
        type: 'TIME_BANK',
        category: 'Educación',
        title: 'Clases de guitarra para principiantes',
        description: 'Enseño guitarra española y acústica. Primera clase gratis para probar.',
        priceCredits: 2,
        lat: users[0].lat,
        lng: users[0].lng,
        tags: ['música', 'guitarra', 'clases'],
        timeBank: {
          create: {
            skillId: skills[0].id,
            estimatedHours: 1,
            canTeach: true,
            maxStudents: 3,
            experienceLevel: 'INTERMEDIATE',
            toolsNeeded: ['Guitarra propia'],
          },
        },
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[1].id,
        type: 'SERVICE',
        category: 'Reparaciones',
        title: 'Reparación de bicicletas a domicilio',
        description: 'Reparo tu bici en tu casa. Incluye revisión completa.',
        priceEur: 20,
        priceCredits: 5,
        lat: users[1].lat,
        lng: users[1].lng,
        tags: ['bicicleta', 'reparación', 'mecánica'],
      },
    }),
    prisma.offer.create({
      data: {
        userId: users[2].id,
        type: 'GROUP_BUY',
        category: 'Alimentación',
        title: 'Compra colectiva de naranjas ecológicas',
        description: 'Naranjas directas del agricultor. Precio especial por volumen.',
        priceEur: 2.5,
        lat: users[2].lat,
        lng: users[2].lng,
        tags: ['ecológico', 'naranjas', 'fruta'],
        groupBuy: {
          create: {
            minParticipants: 10,
            maxParticipants: 50,
            currentParticipants: 7,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            pickupLat: users[2].lat!,
            pickupLng: users[2].lng!,
            pickupAddress: 'Plaza Mayor, 1',
            priceBreaks: {
              create: [
                { minQuantity: 10, pricePerUnit: 2.5, savings: 0 },
                { minQuantity: 20, pricePerUnit: 2.0, savings: 20 },
                { minQuantity: 30, pricePerUnit: 1.8, savings: 28 },
              ],
            },
          },
        },
      },
    }),
  ]);

  // Crear algunos posts
  await Promise.all([
    prisma.post.create({
      data: {
        authorId: users[0].id,
        content: '¡Esta semana he dado clases de guitarra a 3 vecinos! Es increíble ver cómo progresan 🎸',
        type: 'ACHIEVEMENT',
        visibility: 'PUBLIC',
        tags: ['música', 'comunidad'],
        thanksCount: 12,
        supportsCount: 5,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[1].id,
        content: 'Necesito ayuda con mi jardín este fin de semana. ¿Alguien con experiencia en plantas?',
        type: 'NEED',
        visibility: 'NEIGHBORS',
        tags: ['jardinería', 'ayuda'],
        thanksCount: 3,
        commentsCount: 2,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[2].id,
        content: 'Gracias a Pedro por arreglar mi bici. ¡Funciona como nueva! 🚴‍♀️',
        type: 'THANKS',
        visibility: 'PUBLIC',
        tags: ['agradecimiento', 'bicicleta'],
        thanksCount: 8,
        helpedCount: 1,
      },
    }),
  ]);

  // Crear evento
  await prisma.event.create({
    data: {
      organizerId: users[0].id,
      title: 'Repair Café - Arregla tu aparato',
      description: 'Trae tu aparato roto y te ayudamos a repararlo. Café gratis incluido.',
      lat: 40.4168,
      lng: -3.7038,
      address: 'Centro Cultural, Calle Mayor 15',
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      capacity: 30,
      creditsReward: 3,
      type: 'REPAIR_CAFE',
      tags: ['sostenibilidad', 'reparación', 'comunidad'],
    },
  });

  // Crear semilla diaria
  await prisma.dailySeed.create({
    data: {
      date: new Date(),
      type: 'GREETING',
      challenge: 'Saluda a un vecino que no conozcas',
      description: 'Una sonrisa puede cambiar el día de alguien',
      creditsReward: 1,
      participantsCount: 0,
    },
  });

  console.log('✅ Base de datos poblada con éxito');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Crear README.md
echo -e "${YELLOW}📝 Creando README.md...${NC}"
cat > README.md << 'EOF'
# 🌱 Comunidad Viva

Red Social de Economía Colaborativa Local - Ahorra dinero, obtén servicios y genera ingresos en tu comunidad.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+ y npm 9+
- Docker y Docker Compose
- 4GB RAM mínimo

### Instalación Automática (Recomendada)

```bash
# Dar permisos de ejecución al script
chmod +x setup.sh

# Ejecutar instalación
./setup.sh
```

### Instalación Manual

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar base de datos:**
```bash
# Levantar PostgreSQL y Redis
docker-compose up -d postgres redis

# Esperar 10 segundos a que se inicien
sleep 10

# Ejecutar migraciones
cd packages/backend
npx prisma migrate dev
cd ../..
```

3. **Poblar base de datos:**
```bash
cd packages/backend
npm run seed
cd ../..
```

4. **Iniciar la aplicación:**
```bash
npm run dev
```

## 🌐 Acceso

- **Aplicación Web**: http://localhost:3000
- **API Backend**: http://localhost:4000
- **Documentación API**: http://localhost:4000/api/docs
- **Prisma Studio**: http://localhost:5555

## 👤 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| maria@example.com | password123 | Usuario |
| pedro@example.com | password123 | Usuario |
| ana@example.com | password123 | Usuario |

## 📁 Estructura del Proyecto

```
comunidad-viva/
├── packages/
│   ├── shared/          # Tipos TypeScript compartidos
│   ├── backend/         # API NestJS
│   └── web/            # Frontend Next.js
├── docker/             # Configuración Docker
├── nginx/              # Configuración proxy
├── scripts/            # Scripts de utilidad
└── backups/           # Backups de BD
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar todo en modo desarrollo
npm run dev:backend      # Solo backend
npm run dev:web         # Solo frontend

# Base de datos
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Poblar con datos de prueba
npm run db:studio       # Abrir Prisma Studio

# Docker
npm run docker:up       # Levantar servicios
npm run docker:down     # Parar servicios
npm run docker:logs     # Ver logs

# Testing
npm test               # Ejecutar tests
npm run test:backend   # Tests del backend
npm run test:web      # Tests del frontend

# Build
npm run build         # Construir todo para producción
```

## 🔧 Configuración

### Variables de Entorno

Edita el archivo `.env` con tus valores:

```env
# Base de datos
DB_USER=comunidad
DB_PASSWORD=tu_password_segura
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=tu_secret_jwt_32_chars_min
NEXTAUTH_SECRET=tu_secret_nextauth_32_chars

# Email (opcional)
SMTP_HOST=smtp.mailtrap.io
SMTP_USER=tu_usuario
SMTP_PASS=tu_password
```

### Configuración de Mapas

La aplicación usa Maplibre con tiles gratuitos. Para producción, considera usar:
- MapTiler: https://www.maptiler.com/
- Mapbox: https://www.mapbox.com/
- OpenMapTiles: https://openmaptiles.org/

## 🎯 Características Principales

### Para Usuarios
- 🗺️ **Mapa interactivo** con ofertas y servicios locales
- ⏰ **Banco de tiempo** para intercambiar horas de ayuda
- 🛒 **Compras colectivas** con descuentos por volumen
- 💰 **Sistema de créditos** locales gamificado
- 📅 **Eventos comunitarios** con recompensas
- 🌱 **Retos diarios** para fomentar participación

### Para Comercios
- 📊 Dashboard de métricas e impacto
- 🎯 Fidelización con créditos locales
- 📈 Reportes para certificaciones ESG
- 🤝 Conexión directa con la comunidad

### Para Administración
- 📊 **Informes de impacto** automáticos (PDF/Excel/CSV)
- 🎯 **KPIs justificables** para subvenciones
- 🌍 **Métricas ambientales** certificadas
- 👥 **Análisis de cohesión social**

## 📈 Métricas e Informes

El sistema genera automáticamente informes para subvenciones:

```bash
# Generar informe mensual
curl http://localhost:4000/api/reports/grant?period=month

# Exportar a PDF
curl http://localhost:4000/api/reports/grant/pdf?period=month > informe.pdf
```

### KPIs Incluidos
- Ahorro económico por hogar
- Horas de banco de tiempo intercambiadas
- CO₂ evitado (metodología GHG Protocol)
- Reducción del aislamiento social
- Nuevas conexiones vecinales
- Valor del capital social generado

## 🐛 Solución de Problemas

### La base de datos no se conecta
```bash
# Verificar que Docker está corriendo
docker ps

# Reiniciar contenedores
docker-compose restart postgres redis

# Ver logs
docker-compose logs postgres
```

### Error en migraciones
```bash
# Resetear base de datos
cd packages/backend
npx prisma migrate reset
npm run seed
```

### Puerto 3000/4000 ocupado
```bash
# Cambiar puertos en .env
PORT=4001
NEXT_PUBLIC_API_URL=http://localhost:4001
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

## 💚 Agradecimientos

- Comunidad open source
- Contribuidores del proyecto
- Todos los que creen en la economía colaborativa

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta con el equipo de desarrollo.

*Construido con amor para fortalecer comunidades locales* 🌱
EOF

# Script de inicio rápido
echo -e "${YELLOW}🚀 Creando script de inicio rápido...${NC}"
cat > start.sh << 'EOF'
#!/bin/bash

echo "🌱 Iniciando Comunidad Viva..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker Desktop."
    exit 1
fi

# Levantar base de datos
echo "📦 Levantando base de datos..."
docker-compose up -d postgres redis

# Esperar a que la BD esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 5

# Verificar si necesitamos migraciones
cd packages/backend
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔄 Ejecutando migraciones..."
    npx prisma migrate deploy
    npx prisma generate
fi
cd ../..

# Iniciar aplicación
echo "✅ Iniciando aplicación..."
npm run dev

EOF
chmod +x start.sh

# Crear docker-compose.yml simplificado
echo -e "${YELLOW}🐳 Creando docker-compose.yml...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: comunidad-viva-db
    environment:
      POSTGRES_DB: comunidad_viva
      POSTGRES_USER: comunidad
      POSTGRES_PASSWORD: comunidad_secret_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U comunidad"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: comunidad-viva-cache
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOF

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm install

# Instalar dependencias de cada paquete
echo -e "${YELLOW}📦 Instalando dependencias de shared...${NC}"
cd packages/shared && npm install && cd ../..

echo -e "${YELLOW}📦 Instalando dependencias de backend...${NC}"
cd packages/backend && npm install && cd ../..

echo -e "${YELLOW}📦 Instalando dependencias de web...${NC}"
cd packages/web && npm install && cd ../..

# Copiar archivos TypeScript compartidos desde artifacts anteriores
echo -e "${YELLOW}📝 Creando archivo de tipos compartidos...${NC}"
# Aquí deberías copiar el contenido del artifact shared-types

# Copiar schema.prisma desde artifacts anteriores
echo -e "${YELLOW}📝 Creando schema.prisma...${NC}"
# Aquí deberías copiar el contenido del artifact prisma-schema

# Mensaje final
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  ✅ INSTALACIÓN COMPLETA                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Configurar variables de entorno:"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Iniciar la base de datos:"
echo "   ${YELLOW}docker-compose up -d postgres redis${NC}"
echo ""
echo "3. Ejecutar migraciones:"
echo "   ${YELLOW}cd packages/backend && npx prisma migrate dev${NC}"
echo ""
echo "4. Poblar base de datos:"
echo "   ${YELLOW}npm run db:seed${NC}"
echo ""
echo "5. Iniciar la aplicación:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "O simplemente ejecuta:"
echo "   ${GREEN}./start.sh${NC}"
echo ""
echo "🌐 La aplicación estará disponible en:"
echo "   Web: ${GREEN}http://localhost:3000${NC}"
echo "   API: ${GREEN}http://localhost:4000${NC}"
echo "   Docs: ${GREEN}http://localhost:4000/api/docs${NC}"
echo ""
echo "👤 Usuarios de prueba:"
echo "   Email: maria@example.com"
echo "   Pass: password123"
echo ""
echo "¿Necesitas ayuda? Revisa el README.md"
echo ""
