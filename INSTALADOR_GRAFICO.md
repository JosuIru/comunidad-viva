# 🚀 Instalador Gráfico - Comunidad Viva

## 📖 Descripción

El instalador gráfico de Comunidad Viva es una interfaz web interactiva similar a WordPress que te guía paso a paso en la configuración inicial de la plataforma.

![Instalador](https://img.shields.io/badge/Instalador-Gráfico-green)
![Estilo](https://img.shields.io/badge/Estilo-WordPress-blue)

---

## ✨ Características

- **Interfaz Visual Intuitiva**: Diseño moderno y fácil de usar
- **Proceso Guiado**: 6 pasos claramente definidos
- **Verificación Automática**: Comprueba todos los requisitos del sistema
- **Configuración de Base de Datos**: Prueba la conexión en tiempo real
- **Migraciones Automáticas**: Crea todas las tablas necesarias
- **Creación de Admin**: Configura tu usuario administrador
- **Datos de Prueba Opcionales**: Incluye ejemplos para probar la plataforma
- **Validación en Tiempo Real**: Verifica cada paso antes de continuar

---

## 🎯 Pasos del Instalador

```
1. 🚀 Bienvenida        → Introducción al instalador
2. 📋 Requisitos        → Verificación del sistema
3. 🗄️ Base de Datos    → Configuración de PostgreSQL
4. 👤 Administrador     → Crear usuario admin
5. ⚙️ Configuración     → Opciones finales
6. 🎉 Finalizar         → ¡Listo para usar!
```

---

## 🚀 Cómo Usar el Instalador

### Paso 1: Preparar el Entorno

Antes de usar el instalador, asegúrate de tener instalado:

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

### Paso 2: Clonar y Configurar

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/comunidad-viva.git
cd comunidad-viva

# Instalar dependencias
npm install
```

### Paso 3: Crear Base de Datos

Crea la base de datos PostgreSQL (el instalador creará las tablas):

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE comunidad_viva;
CREATE USER comunidad WITH ENCRYPTED PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE comunidad_viva TO comunidad;
\q
```

### Paso 4: Iniciar los Servicios

En dos terminales diferentes:

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev
```

El backend iniciará en: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd packages/web
npm run dev
```

El frontend iniciará en: http://localhost:3000

### Paso 5: Acceder al Instalador

Abre tu navegador y visita:

```
http://localhost:3000/installer
```

---

## 📸 Capturas del Instalador

### Pantalla 1: Bienvenida

```
┌────────────────────────────────────────────────┐
│  🌱 Comunidad Viva - Instalador                │
├────────────────────────────────────────────────┤
│                                                 │
│              🚀  🚀  🚀  🚀  🚀  🚀            │
│        Bienvenida  Requisitos  DB  Admin...     │
│              ●━━━━━○━━━━━○━━━━━○              │
│                                                 │
│         ¡Bienvenido a Comunidad Viva!          │
│                                                 │
│  Este asistente te guiará paso a paso en la    │
│  configuración inicial de tu plataforma         │
│                                                 │
│  ⏱️ Tiempo estimado: 5-10 minutos             │
│                                                 │
│  ✓ Verificaremos los requisitos del sistema   │
│  ✓ Configuraremos la base de datos            │
│  ✓ Crearemos tu usuario administrador         │
│  ✓ Inicializaremos la plataforma              │
│                                                 │
│        [ Comenzar Instalación → ]              │
└────────────────────────────────────────────────┘
```

### Pantalla 2: Verificación de Requisitos

```
┌────────────────────────────────────────────────┐
│         Verificación de Requisitos              │
├────────────────────────────────────────────────┤
│                                                 │
│  ✓ Node.js                                     │
│    Versión: v18.17.0 (requerida: 18.0.0)      │
│                                                 │
│  ✓ npm                                         │
│    Versión: 9.6.7 (requerida: 9.0.0)          │
│                                                 │
│  ✓ PostgreSQL                                  │
│    Versión: 14.9 (requerida: 14.0.0)          │
│                                                 │
│  ✓ Espacio en Disco                           │
│    Disponible: 45GB (requerido: 1GB)          │
│                                                 │
│  ✓ Memoria RAM                                 │
│    Disponible: 8GB (requerida: 2GB)           │
│                                                 │
│  [ ← Atrás ]        [ Continuar → ]            │
└────────────────────────────────────────────────┘
```

### Pantalla 3: Configuración de Base de Datos

```
┌────────────────────────────────────────────────┐
│      Configuración de Base de Datos             │
├────────────────────────────────────────────────┤
│                                                 │
│  Host:                                         │
│  ┌────────────────────────────────────────┐   │
│  │ localhost                               │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  Puerto:                                       │
│  ┌────────────────────────────────────────┐   │
│  │ 5432                                    │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  Nombre de la Base de Datos:                  │
│  ┌────────────────────────────────────────┐   │
│  │ comunidad_viva                          │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  Usuario:                                      │
│  ┌────────────────────────────────────────┐   │
│  │ comunidad                               │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  Contraseña:                                   │
│  ┌────────────────────────────────────────┐   │
│  │ ••••••••                                │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  [ ← Atrás ]  [ Probar Conexión → ]            │
└────────────────────────────────────────────────┘
```

### Pantalla 4: Crear Administrador

```
┌────────────────────────────────────────────────┐
│        Crear Usuario Administrador              │
├────────────────────────────────────────────────┤
│                                                 │
│  Nombre Completo:                              │
│  ┌────────────────────────────────────────┐   │
│  │ Juan Pérez                              │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  Email:                                        │
│  ┌────────────────────────────────────────┐   │
│  │ admin@ejemplo.com                       │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  Contraseña:                                   │
│  ┌────────────────────────────────────────┐   │
│  │ ••••••••                                │   │
│  └────────────────────────────────────────┘   │
│  Mínimo 6 caracteres                          │
│                                                 │
│  Confirmar Contraseña:                         │
│  ┌────────────────────────────────────────┐   │
│  │ ••••••••                                │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  [ ← Atrás ]  [ Crear Administrador → ]        │
└────────────────────────────────────────────────┘
```

### Pantalla 5: Configuración Final

```
┌────────────────────────────────────────────────┐
│           Configuración Final                   │
├────────────────────────────────────────────────┤
│                                                 │
│  ☑ Incluir Datos de Prueba                    │
│    Crea usuarios, comunidades, ofertas y       │
│    eventos de ejemplo para probar la plataforma │
│                                                 │
│  ⚠️ Configuraciones Opcionales                 │
│                                                 │
│  Después de completar la instalación, puedes   │
│  configurar:                                    │
│                                                 │
│  • Email (Gmail, SMTP personalizado)          │
│  • AWS S3 (almacenamiento de imágenes)        │
│  • Redis (caché y rendimiento)                │
│  • Blockchain (Polygon, Solana)               │
│                                                 │
│  Consulta la documentación para más detalles.  │
│                                                 │
│  [ ← Atrás ]  [ Finalizar Instalación → ]      │
└────────────────────────────────────────────────┘
```

### Pantalla 6: Instalación Completada

```
┌────────────────────────────────────────────────┐
│         ¡Instalación Completada!                │
├────────────────────────────────────────────────┤
│                                                 │
│                    🎉                          │
│                                                 │
│  Comunidad Viva ha sido instalado              │
│  exitosamente.                                  │
│                                                 │
│  📝 Próximos Pasos:                            │
│                                                 │
│  1. Inicia sesión con tu cuenta de admin      │
│  2. Explora las diferentes secciones          │
│  3. Configura las opciones adicionales        │
│  4. Consulta la documentación                 │
│                                                 │
│  Serás redirigido al login en 3 segundos...   │
│                                                 │
│            [ Ir al Login → ]                   │
└────────────────────────────────────────────────┘
```

---

## 🔧 Arquitectura del Instalador

### Backend (NestJS)

Ubicación: `packages/backend/src/installer/`

```
📁 installer/
├── 📄 installer.controller.ts  # Endpoints API
├── 📄 installer.service.ts     # Lógica del instalador
└── 📄 installer.module.ts      # Módulo de NestJS
```

**Endpoints Disponibles:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/installer` | Página de bienvenida |
| GET | `/installer/check-requirements` | Verificar requisitos |
| POST | `/installer/database` | Probar conexión BD |
| POST | `/installer/create-admin` | Crear usuario admin |
| POST | `/installer/migrate` | Ejecutar migraciones |
| POST | `/installer/seed` | Poblar BD con datos |
| POST | `/installer/complete` | Marcar como instalado |
| GET | `/installer/status` | Estado de instalación |

### Frontend (Next.js)

Ubicación: `packages/web/src/pages/installer/index.tsx`

**Componente React con:**
- State management para cada paso
- Validaciones en tiempo real
- Llamadas API al backend
- Interfaz responsive con Tailwind CSS
- Animaciones y feedback visual

---

## 🔒 Seguridad

El instalador incluye varias medidas de seguridad:

1. **Solo Accesible si No Está Instalado**: Una vez completada la instalación, se crea un archivo `.installed` que impide acceder nuevamente al instalador.

2. **Validación de Contraseñas**:
   - Mínimo 6 caracteres
   - Confirmación de contraseña
   - Hash con bcrypt

3. **Prueba de Conexión BD**: No guarda credenciales inválidas

4. **Protección de Rutas**: El decorador `@Public()` permite acceso sin autenticación solo durante la instalación

---

## 🛠️ Personalización

### Modificar Estilos

El instalador usa Tailwind CSS. Puedes personalizar los colores editando:

```tsx
// En packages/web/src/pages/installer/index.tsx

// Cambiar color primario (verde → azul)
className="bg-green-500" → className="bg-blue-500"
className="text-green-500" → className="text-blue-500"
```

### Añadir Pasos Adicionales

1. Agrega el paso al array `steps`:

```tsx
const steps = [
  // ... pasos existentes
  { id: 7, name: 'Nuevo Paso', icon: '⚡' },
];
```

2. Añade la lógica del paso:

```tsx
{currentStep === 7 && (
  <div>
    <h2>Tu Nuevo Paso</h2>
    {/* Contenido del paso */}
  </div>
)}
```

3. Actualiza la navegación

### Personalizar Requisitos

Edita el método `checkRequirements` en `installer.service.ts`:

```typescript
requirements.tuRequisito = {
  installed: true/false,
  version: 'x.x.x',
  required: 'x.x.x'
};
```

---

## 📝 Archivos Generados

Durante la instalación se crean/modifican estos archivos:

```
📁 packages/backend/
├── 📄 .env                    # Variables de entorno
├── 📄 .installed              # Flag de instalación completa
└── 📁 prisma/
    └── 📁 migrations/        # Migraciones ejecutadas
```

---

## 🐛 Solución de Problemas

### Problema 1: No aparece el instalador

**Solución:**
1. Verifica que ambos servicios estén corriendo (backend y frontend)
2. Asegúrate de acceder a `http://localhost:3000/installer`
3. Limpia la caché del navegador (Ctrl+Shift+R)

### Problema 2: Error conectando a PostgreSQL

**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   sudo systemctl status postgresql
   ```
2. Verifica las credenciales (usuario, contraseña, base de datos)
3. Asegúrate de que la base de datos existe:
   ```bash
   sudo -u postgres psql -l | grep comunidad_viva
   ```

### Problema 3: Migraciones fallan

**Solución:**
1. Verifica permisos del usuario en PostgreSQL:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE comunidad_viva TO comunidad;
   ALTER USER comunidad CREATEDB;
   ```
2. Borra el directorio de migraciones y vuelve a intentar:
   ```bash
   rm -rf packages/backend/prisma/migrations
   ```

### Problema 4: El instalador se cuelga en un paso

**Solución:**
1. Abre la consola del navegador (F12) y busca errores
2. Revisa los logs del backend en la terminal
3. Verifica conectividad con la API:
   ```bash
   curl http://localhost:4000/installer/status
   ```

### Problema 5: Ya instalado pero quiero reinstalar

**Solución:**
```bash
# Borrar flag de instalación
rm packages/backend/.installed

# Borrar base de datos
sudo -u postgres psql
DROP DATABASE comunidad_viva;
CREATE DATABASE comunidad_viva;
\q

# Refrescar el navegador y volver a instalar
```

---

## 📚 Referencias

- [Guía de Instalación Manual](GUIA_INSTALACION.md)
- [README Principal](README.md)
- [Documentación de Backend](packages/backend/README.md)
- [API de Prisma](https://www.prisma.io/docs)

---

## 🤝 Contribuir

¿Mejoras para el instalador? Pull requests son bienvenidos!

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/MejorInstalador`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/MejorInstalador`)
5. Abre un Pull Request

---

## 📜 Licencia

MIT License - Instalador incluido como parte de Comunidad Viva

---

> "La instalación debería ser tan fácil como plantar una semilla 🌱"
>
> "Si WordPress puede, nosotros también"
