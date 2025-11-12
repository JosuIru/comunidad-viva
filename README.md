# 🚚 Truk

Plataforma de economía colaborativa local e intercambio comunitario.

---

## 📋 Descripción

Truk es una aplicación web moderna que facilita el intercambio de bienes y servicios en comunidades locales mediante un sistema de créditos y economía colaborativa.

### Características Principales

- 💱 **Sistema de Créditos**: Moneda interna para intercambios
- 🏘️ **Comunidades**: Gestión de comunidades locales
- 🎯 **Ofertas y Demandas**: Marketplace de bienes y servicios
- 🏠 **Vivienda Cooperativa**: Sistema de vivienda compartida
- 🤝 **Ayuda Mutua**: Proyectos y necesidades comunitarias
- 📊 **Gamificación**: Logros, desafíos y recompensas

---

## 🚀 Quick Start

### Opción 1: Railway (Recomendado - 5 minutos)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
cd truk
railway init

# Deploy backend
cd packages/backend
railway up

# Deploy frontend  
cd ../web
railway up
```

**Ver guías detalladas**: [`docs/deployment/`](docs/deployment/)

### Opción 2: Desarrollo Local

```bash
# Clonar
git clone https://github.com/JosuIru/comunidad-viva.git truk
cd truk

# Instalar
npm install

# Configurar .env
cp packages/backend/.env.example packages/backend/.env
cp packages/web/.env.example packages/web/.env.local

# Base de datos
cd packages/backend
npx prisma migrate dev
npm run seed

# Iniciar
cd ../..
npm run dev
```

**URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

---

## 🛠️ Stack

**Backend**: NestJS, Prisma, PostgreSQL, Redis, Socket.io
**Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
**Languages**: ES, EU, EN, CA

---

## 📦 Estructura

```
truk/
├── packages/
│   ├── backend/          # API NestJS
│   ├── web/              # Frontend Next.js
│   └── blockchain/       # Contratos (opcional)
├── docs/                 # Documentación
│   ├── deployment/       # Guías de despliegue
│   └── archive/          # Histórico
└── scripts/              # Utilidades
```

---

## 🌐 Despliegue

| Opción | Precio | Dificultad | Guía |
|--------|--------|------------|------|
| **Railway** ⭐ | $10-15/mes | ⭐ Fácil | [Quick Start](docs/deployment/QUICK_START_RAILWAY.md) |
| **Servidor Compartido** | $5-20/mes | ⭐⭐ Media | [Guía](docs/deployment/DEPLOYMENT_SHARED_HOSTING.md) |
| **Dinahosting** | Variable | ⭐⭐ Media | [Guía](docs/deployment/DEPLOYMENT_DINAHOSTING.md) |

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Guía general de despliegue |
| [PRODUCTION_READY.md](PRODUCTION_READY.md) | Checklist de producción |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guía de contribución |
| [SECURITY.md](SECURITY.md) | Política de seguridad |

---

## 📊 Estado: ✅ Producción Lista

- ✅ Backend API completo
- ✅ Frontend funcional
- ✅ Autenticación JWT
- ✅ Sistema de créditos
- ✅ Gamificación
- ✅ Internacionalización (4 idiomas)
- ✅ WebSockets
- ✅ Listo para producción

**Versión**: 1.0.0

---

## 🤝 Contribuir

Ver: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 Licencia

MIT License

---

## 👥 Autor

**Josu** - [@JosuIru](https://github.com/JosuIru)

---

**¿Listo para empezar?** 👉 [Deploy en Railway](docs/deployment/QUICK_START_RAILWAY.md)
