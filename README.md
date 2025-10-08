# Comunidad Viva

Red social de economía colaborativa local con sistema híbrido revolucionario de capas económicas.

**🚀 [Quick Start Guide](QUICK_START.md)** - Empieza en 5 minutos

**📚 Documentación:**
- [API Reference](API_REFERENCE.md) - Referencia completa de ~120 endpoints
- [Changelog](CHANGELOG.md) - Historial de implementaciones
- [Sistema Híbrido](packages/backend/src/hybrid/README.md) - Guía del sistema de capas económicas
- [Gobernanza](CONSENSUS_GOVERNANCE_GUIDE.md) - Proof of Help y consenso descentralizado

## 🌟 Características Principales

### 🔄 Sistema Híbrido de Capas Económicas

**Innovación revolucionaria:** Primer sistema que permite la coexistencia pacífica de 3 paradigmas económicos diferentes.

#### Capas Disponibles

- **🏦 TRADITIONAL (Capitalismo)**
  - Precios en euros y créditos
  - Transacciones tradicionales
  - Sistema de reviews y reputación
  - Ideal para comercio local

- **🔄 TRANSITIONAL (Pay-it-Forward)**
  - Economía de regalo gradual
  - "Paga lo que recibiste, cuando puedas"
  - Sistema de cadena de favores
  - Transición suave hacia economía colaborativa

- **🎁 GIFT_PURE (Economía de Regalo Pura)**
  - Post-dinero, sin precios ni intercambios
  - Compartir abundancia anónimamente
  - Expresar necesidades sin vergüenza
  - Celebraciones comunitarias de abundancia
  - Cero tracking, cero deuda

- **🦎 CHAMELEON (Experimental)**
  - Prueba diferentes capas temporalmente
  - Bridge events para experimentos comunitarios
  - Sin compromiso permanente
  - Perfecto para explorar

#### Funcionalidades del Sistema

- ✅ **Migración libre entre capas** - Cambia cuando quieras
- ✅ **Estadísticas en tiempo real** - Ve la distribución de tu comunidad
- ✅ **Bridge events** - Experimentos temporales (ej: "semana sin dinero")
- ✅ **Umbral de migración** - Si 70% está en GIFT, propón migración colectiva
- ✅ **Configuración por comunidad** - Cada comunidad elige sus reglas
- ✅ **Métricas detalladas** - Analytics de transiciones económicas

**Total:** 16 endpoints REST completamente funcionales

[📖 Documentación completa del Sistema Híbrido](packages/backend/src/hybrid/README.md)

---

### 🎮 Gamificación y Engagement Viral

**Sistema completo para maximizar engagement y retención de usuarios.**

#### Onboarding Gamificado
- Tutorial interactivo de 5 pasos
- Recompensas por completar perfil (+50 créditos)
- Guía contextual personalizada

#### Flash Deals (Ofertas Relámpago)
- Descuentos por tiempo limitado (2-4 horas)
- Scarcity marketing (cantidades limitadas)
- Notificaciones push en tiempo real
- Rotación automática 3 veces al día

#### Stories (Historias 24h)
- Contenido efímero tipo Instagram
- Auto-destrucción después de 24 horas
- Contador de vistas
- Perfecto para compartir momentos

#### Swipe & Match
- Descubrimiento tipo Tinder para ofertas
- Like / Dislike / Super Like
- Matches cuando ambas partes están interesadas
- Algoritmo de recomendación personalizado

#### Challenges (Retos)
- Retos semanales rotativos
- Leaderboard con rankings
- Bonus especial para los primeros 10
- Tipos: ayudar vecinos, crear ofertas, asistir eventos

#### Sistema de Referidos
- Códigos personalizados únicos
- Recompensas para ambas partes (20 + 10 créditos)
- Milestones con bonos progresivos
- Tracking de referidos activos

#### Sugerencias Personalizadas
- IA para recomendar ofertas relevantes
- Sugerencias de eventos cercanos
- Conexiones con usuarios afines
- Basado en historial y preferencias

#### Live Events
- Eventos en vivo con contadores
- Check-in presencial
- Premios para participantes
- Gamificación de eventos físicos

#### Micro-actions (Acciones Diarias)
- Pequeñas tareas con recompensas inmediatas
- Se resetean cada día
- Tipos: ver 3 ofertas, dar 1 like, comentar post
- +2-5 créditos por acción

#### Niveles y Progresión
- 10 niveles de progresión (1-10)
- Sistema de XP por acciones
- Perks desbloqueables por nivel
- Badges especiales por hitos

#### Streaks (Rachas)
- Racha de días activos consecutivos
- Multiplicador de recompensas (hasta ×2)
- Milestones: 7, 14, 30, 60, 90 días
- Badges por constancia

#### Happy Hour
- Períodos con créditos dobles
- Activación automática 2-3 veces/semana
- Duración: 1-2 horas
- Notificación al iniciar

**Total:** 32 endpoints (26 funcionales + 6 admin)

---

### 🏛️ Gobernanza Descentralizada (Proof of Help)

**Sistema de consenso inspirado en Bitcoin, adaptado para economía colaborativa.**

#### Proof of Help (PoH)
- **Minería = Ayudar a otros** (no consumir energía)
- Cada hora de ayuda genera "hash de trabajo"
- La validación requiere haber ayudado previamente
- Consenso basado en reputación social verificable

#### Trust Chain (Blockchain Local)
- Cadena de confianza inmutable
- Cada ayuda = un bloque enlazado
- Hash criptográfico + prueba de trabajo social
- 4 tipos de bloques: HELP, PROPOSAL, VALIDATION, DISPUTE

#### Sistema de Reputación
- Cálculo automático basado en contribuciones
- 3 niveles con privilegios progresivos:
  - **Activo** (10+ ayudas): Validar transacciones simples
  - **Contribuidor** (50+ ayudas): Validar propuestas
  - **Experto** (100+ ayudas): Resolver disputas

- Factores de reputación:
  - Ayudas dadas (×5)
  - Ayudas recibidas (×2)
  - Badges ganados (×10)
  - Conexiones sociales (×1)
  - Antigüedad (×3 por mes)
  - Validaciones correctas (×3)

#### Propuestas Comunitarias (CIPs)
- **Community Improvement Proposals**
- Requiere reputación 20+ para crear
- Fase de discusión: 3 días
- Fase de votación: 4 días
- Votación cuadrática (evita que pocos dominen)
- 4 tipos: FEATURE, RULE_CHANGE, FUND_ALLOCATION, PARTNERSHIP

#### Votación Cuadrática
```
Votar 1 punto  → Cuesta 1² = 1 crédito
Votar 5 puntos → Cuesta 5² = 25 créditos
Votar 10 puntos → Cuesta 10² = 100 créditos
```
Ventaja: Promueve consenso amplio vs dictadura de mayorías

#### Moderación Descentralizada
- Mini-DAOs temporales por cada reporte
- Jurado aleatorio (5-7 personas):
  - 3 con alta reputación
  - 2 usuarios aleatorios
- Consenso 66% requerido
- 3 decisiones: KEEP, REMOVE, WARN
- Jurados correctos ganan 1 crédito

#### Validación de Ayudas
- Cada transacción de banco de tiempo requiere consenso
- 3 validadores seleccionados por:
  - Proximidad geográfica (40%)
  - Reputación (40%)
  - Aleatoriedad (20%)
- Consenso 2/3 → Transacción aprobada
- Validadores ganan 1 crédito por validación correcta

**Beneficios sobre sistemas centralizados:**
- ✅ Sin punto único de fallo
- ✅ Resistente a censura
- ✅ Incentivos alineados con bien común
- ✅ Transparencia total y auditabilidad
- ✅ Gobernanza evolutiva

[📖 Guía completa de Gobernanza](CONSENSUS_GOVERNANCE_GUIDE.md)

---

### 📋 Funcionalidades Base

- ✅ **Autenticación JWT** - Registro, login, gestión de sesiones
- ✅ **Gestión de Usuarios** - Perfiles, avatares, configuración
- ✅ **Comunidades** - Locales, temáticas, profesionales
- ✅ **Sistema de Ofertas** - Productos, servicios, banco de tiempo
- ✅ **Eventos** - Crear, asistir, gestionar eventos comunitarios
- ✅ **Banco de Tiempo** - Registrar ayudas, balance de horas
- ✅ **Compras Grupales** - Organizar compras colectivas
- ✅ **Mensajería** - Chat 1-a-1 entre usuarios
- ✅ **Notificaciones** - Push notifications en tiempo real
- ✅ **Sistema de Reviews** - Calificaciones y comentarios
- ✅ **Búsqueda** - Full-text search de ofertas, usuarios, comunidades
- ✅ **Analytics** - Dashboard con métricas clave
- ✅ **Upload de Imágenes** - Almacenamiento de fotos

---

### 📊 Estadísticas del Proyecto

- **Total Endpoints:** ~120
- **Módulos Backend:** 20+
- **Paradigmas Económicos:** 3
- **Niveles de Gamificación:** 10
- **Tipos de Bloques PoH:** 4
- **Líneas de Documentación:** 2000+

## 🚀 Estructura del Proyecto

```
comunidad-viva/
├── packages/
│   ├── backend/          # API NestJS con Prisma
│   ├── web/              # Frontend Next.js
│   └── shared/           # Tipos compartidos
├── nginx/                # Configuración nginx
├── backups/              # Backups de base de datos
├── scripts/              # Scripts de utilidad
├── docker-compose.yml    # Configuración Docker desarrollo
├── docker-compose.prod.yml  # Configuración Docker producción
└── Makefile             # Comandos de gestión
```

## 📋 Requisitos

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd comunidad-viva
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 3. Instalar dependencias

```bash
make install
```

## 🏃 Desarrollo

### Levantar entorno de desarrollo

```bash
make dev
```

Esto levantará:
- Backend API: http://localhost:4000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Ejecutar migraciones

```bash
make migrate
```

### Poblar base de datos con datos de prueba

```bash
make seed
```

## 🚢 Producción

### Build de imágenes Docker

```bash
make build
```

### Levantar en producción

```bash
make prod
```

### Configuración SSL para nginx

Genera certificados SSL y colócalos en `nginx/ssl/`:

```bash
mkdir -p nginx/ssl
# Generar certificados auto-firmados (desarrollo)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# Para producción, usa Let's Encrypt o tu proveedor de certificados
```

## 📊 Monitoreo

### Levantar stack de monitoreo

```bash
make monitor
```

Esto levantará:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## 💾 Backups

### Crear backup manual

```bash
make backup
```

### Restaurar desde backup

```bash
make restore
# Ingresar nombre del archivo de backup cuando se solicite
```

Los backups se crean automáticamente cada 24 horas y se mantienen por 7 días.

## 🧪 Testing

```bash
make test
```

## 📝 Comandos disponibles

```bash
make help          # Ver todos los comandos disponibles
make install       # Instalar dependencias
make dev           # Desarrollo
make prod          # Producción
make build         # Build de imágenes
make test          # Ejecutar tests
make clean         # Limpiar contenedores y volúmenes
make backup        # Backup de BD
make restore       # Restaurar BD
make seed          # Datos de prueba
make migrate       # Migraciones
make monitor       # Stack de monitoreo
make logs          # Ver logs
make stop          # Detener servicios
make restart       # Reiniciar servicios
make status        # Estado de servicios
```

## 🔐 Seguridad

### Variables de entorno importantes

Asegúrate de cambiar estos valores en producción:

- `DB_PASSWORD`: Contraseña segura para PostgreSQL
- `JWT_SECRET`: Secreto para JWT (mínimo 32 caracteres)
- `NEXTAUTH_SECRET`: Secreto para NextAuth (mínimo 32 caracteres)

### Headers de seguridad

Nginx está configurado con headers de seguridad:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy

### Rate limiting

API endpoints tienen rate limiting configurado:
- API general: 10 req/s
- Auth endpoints: 5 req/m

## 🚀 Deploy en producción

### GitHub Actions

El proyecto incluye un workflow de CI/CD que:
1. Ejecuta tests y linting
2. Escaneo de seguridad con Trivy
3. Build y push de imágenes Docker
4. Deploy automático a producción

### Variables de entorno necesarias en GitHub Secrets:

- `PROD_HOST`: Host del servidor de producción
- `PROD_USER`: Usuario SSH
- `PROD_SSH_KEY`: Clave SSH privada

### Deploy manual

```bash
# En el servidor de producción
cd /opt/comunidad-viva
git pull
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 📚 Documentación API

### Documentación Interactiva

Una vez levantado el backend, accede a:
- **Swagger UI:** http://localhost:4000/api/docs

### Referencias Completas

- **[📖 API Reference](API_REFERENCE.md)** - Documentación completa de todos los endpoints (~120 endpoints)
- **[📖 Sistema Híbrido](packages/backend/src/hybrid/README.md)** - Guía del sistema de capas económicas
- **[📖 Gobernanza](CONSENSUS_GOVERNANCE_GUIDE.md)** - Proof of Help y consenso descentralizado
- **[📖 Changelog](CHANGELOG.md)** - Historial de implementaciones y cambios

### Principales Grupos de Endpoints

#### Sistema Híbrido (16 endpoints)
```
POST   /hybrid/migrate              - Migrar entre capas económicas
GET    /hybrid/layer                - Obtener capa actual
GET    /hybrid/stats                - Estadísticas de distribución
POST   /hybrid/abundance            - Compartir abundancia (GIFT_PURE)
GET    /hybrid/abundance            - Listar recursos compartidos
POST   /hybrid/needs                - Expresar necesidad
GET    /hybrid/needs                - Ver necesidades de la comunidad
POST   /hybrid/bridge-events        - Crear experimento temporal
GET    /hybrid/bridge-events        - Listar experimentos activos
POST   /hybrid/celebrations         - Registrar celebración
GET    /hybrid/celebrations         - Ver celebraciones recientes
GET    /hybrid/migration-threshold  - Verificar umbral de migración
GET    /hybrid/config               - Configuración de comunidad
PUT    /hybrid/config               - Actualizar configuración
GET    /hybrid/transitions          - Historial de migraciones
GET    /hybrid/layer-metrics        - Métricas detalladas
```

#### Gamificación Viral (32 endpoints)
```
# Onboarding
POST   /viral-features/onboarding/start          - Iniciar onboarding
POST   /viral-features/onboarding/complete-step  - Completar paso
GET    /viral-features/onboarding/progress       - Ver progreso

# Flash Deals
GET    /viral-features/flash-deals/active        - Ver ofertas activas
POST   /viral-features/flash-deals/claim/:id     - Reclamar oferta

# Stories
POST   /viral-features/stories                   - Crear story
GET    /viral-features/stories                   - Ver stories activas
POST   /viral-features/stories/:id/view          - Marcar como vista

# Swipe & Match
GET    /viral-features/swipe/next                - Siguiente oferta
POST   /viral-features/swipe                     - Swipe (like/dislike)
GET    /viral-features/swipe/matches             - Ver matches

# Challenges
GET    /viral-features/challenges/weekly         - Reto semanal
GET    /viral-features/challenges/leaderboard    - Clasificación

# Referidos
GET    /viral-features/referrals/code            - Mi código
POST   /viral-features/referrals/use             - Usar código
GET    /viral-features/referrals/stats           - Estadísticas

# Otros
GET    /viral-features/suggestions               - Sugerencias personalizadas
GET    /viral-features/live-events/active        - Eventos en vivo
GET    /viral-features/micro-actions/daily       - Acciones diarias
GET    /viral-features/levels/progress           - Progreso de nivel
GET    /viral-features/streaks                   - Racha actual
GET    /viral-features/happy-hour/status         - Estado happy hour

# Admin (triggers manuales)
POST   /admin/create-flash-deals                 - Crear flash deals
POST   /admin/activate-happy-hour                - Activar happy hour
POST   /admin/create-weekly-challenge            - Crear reto semanal
POST   /admin/clean-expired-stories              - Limpiar stories
POST   /admin/reset-daily-actions                - Reiniciar acciones
POST   /admin/update-streaks                     - Actualizar rachas
```

#### Gobernanza y Consenso
```
# Trust Blocks
POST   /consensus/blocks                    - Crear bloque
POST   /consensus/blocks/:id/validate       - Validar bloque

# Propuestas (CIPs)
POST   /consensus/proposals                 - Crear propuesta
POST   /consensus/proposals/:id/vote        - Votar propuesta
GET    /consensus/proposals                 - Listar propuestas

# Moderación
POST   /consensus/moderation                - Reportar contenido
POST   /consensus/moderation/:id/vote       - Votar moderación

# Reputación
GET    /consensus/reputation                - Mi reputación
GET    /consensus/reputation/:userId        - Reputación de usuario
```

#### Core Features
- **Autenticación:** `/auth/*` (login, register, logout)
- **Usuarios:** `/users/*` (profile, settings)
- **Comunidades:** `/communities/*` (CRUD, join/leave)
- **Ofertas:** `/offers/*` (CRUD, interested)
- **Eventos:** `/events/*` (CRUD, attend)
- **Banco de Tiempo:** `/timebank/*` (transactions, balance)
- **Compras Grupales:** `/groupbuys/*` (CRUD, join)
- **Mensajes:** `/messages/*` (conversations, send)
- **Notificaciones:** `/notifications/*` (list, read)
- **Búsqueda:** `/search/*` (offers, users, communities)
- **Reviews:** `/reviews/*` (create, list)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 🆘 Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.
