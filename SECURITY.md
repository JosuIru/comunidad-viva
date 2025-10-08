# 🔒 Política de Seguridad

## 📢 Reportar una Vulnerabilidad

La seguridad de **Comunidad Viva** es una de nuestras principales prioridades. Agradecemos a los investigadores de seguridad y usuarios que reportan vulnerabilidades de manera responsable.

### 🚨 Cómo Reportar

Si descubres una vulnerabilidad de seguridad, por favor **NO la reportes públicamente**. Sigue estos pasos:

1. **Crea un Security Advisory en GitHub:**
   - Ve a la [pestaña Security](https://github.com/JosuIru/comunidad-viva/security)
   - Click en "Report a vulnerability"
   - Completa el formulario con los detalles

2. **O envía un email a:** [Añadir email de seguridad]
   - Asunto: `[SECURITY] Breve descripción`
   - Incluye toda la información relevante

### 📋 Información Necesaria

Para ayudarnos a entender y resolver el problema rápidamente, incluye:

- **Tipo de vulnerabilidad** (ej. XSS, SQL injection, CSRF, etc.)
- **Ubicación:** Archivos, endpoints o componentes afectados
- **Impacto:** Qué puede hacer un atacante con esta vulnerabilidad
- **Pasos para reproducir:** Instrucciones detalladas
- **Prueba de concepto (PoC):** Si es posible, código o screenshots
- **Posible solución:** Si tienes una idea de cómo arreglarlo
- **Herramientas utilizadas:** Para detectar la vulnerabilidad

### ⏱️ Proceso de Respuesta

| Tiempo | Acción |
|--------|--------|
| 24-48 horas | Confirmación de recepción del reporte |
| 1 semana | Evaluación inicial y severidad |
| 30 días | Solución y parche (para vulnerabilidades críticas) |
| 90 días | Divulgación pública coordinada (si aplica) |

## 🛡️ Versiones Soportadas

Actualmente damos soporte de seguridad a las siguientes versiones:

| Versión | Soportada          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## 🎯 Scope (Alcance)

### ✅ En Scope

Las siguientes áreas están en el alcance de seguridad:

- **Backend API** (`packages/backend/`)
  - Autenticación y autorización
  - Endpoints de la API REST
  - Validación de datos y sanitización
  - Inyección SQL, NoSQL
  - Rate limiting y DoS

- **Frontend** (`packages/web/`)
  - XSS (Cross-Site Scripting)
  - CSRF (Cross-Site Request Forgery)
  - Validación de formularios
  - Manejo de tokens y credenciales

- **Base de Datos**
  - Esquema de Prisma
  - Migraciones
  - Permisos y roles

- **Infraestructura**
  - Docker containers
  - Configuración de nginx
  - Variables de entorno
  - CI/CD pipelines

### ❌ Fuera de Scope

- **Ataques de fuerza bruta** (tenemos rate limiting)
- **Vulnerabilidades en dependencias de terceros** ya conocidas públicamente (usa dependabot)
- **Social engineering**
- **Physical security**
- **DDoS volumétricos**

## 🏆 Reconocimientos

Reconocemos públicamente a los investigadores que reportan vulnerabilidades de forma responsable:

### Hall of Fame 🌟

<!-- Aquí irán los reconocimientos -->

| Investigador | Fecha | Vulnerabilidad |
|--------------|-------|----------------|
| - | - | - |

*¿Quieres aparecer aquí? Reporta una vulnerabilidad de forma responsable.*

## 🔐 Mejores Prácticas de Seguridad

### Para Desarrolladores

1. **Nunca commitees secretos**
   ```bash
   # Usa .env para desarrollo local
   cp .env.example .env

   # Los archivos .env están en .gitignore
   ```

2. **Valida todas las entradas**
   ```typescript
   // Usa DTOs y class-validator
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   username: string;
   ```

3. **Sanitiza outputs**
   ```typescript
   // Usa el decorador @Sanitize
   @Sanitize()
   async createPost(@Body() data: CreatePostDto) {
     // ...
   }
   ```

4. **Implementa rate limiting**
   ```typescript
   @Throttle(5, 60) // 5 requests por minuto
   async sensitiveEndpoint() {
     // ...
   }
   ```

5. **Usa prepared statements**
   ```typescript
   // Prisma usa prepared statements automáticamente
   await prisma.user.findUnique({
     where: { id: userId }
   });
   ```

### Para Usuarios

1. **Usa contraseñas fuertes**
   - Mínimo 12 caracteres
   - Mezcla de mayúsculas, minúsculas, números y símbolos
   - Usa un gestor de contraseñas

2. **Habilita 2FA cuando esté disponible**

3. **Mantén tu navegador actualizado**

4. **No compartas tus credenciales**

5. **Revisa la actividad de tu cuenta regularmente**

## 🔍 Herramientas de Seguridad

Usamos las siguientes herramientas para mantener la seguridad:

- **Dependabot:** Actualizaciones automáticas de dependencias
- **Trivy:** Escaneo de vulnerabilidades en containers
- **ESLint Security Plugin:** Análisis estático de código
- **GitHub CodeQL:** Análisis de seguridad automático
- **npm audit:** Auditoría de dependencias de Node.js

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)

## 🔄 Actualizaciones de Seguridad

Suscríbete a nuestras notificaciones de seguridad:

1. **Watch** este repositorio en GitHub
2. Selecciona "Custom" → "Security alerts"
3. Recibirás notificaciones de security advisories

## 💰 Bug Bounty Program

Actualmente **no tenemos un programa de bug bounty**, pero valoramos enormemente los reportes de seguridad responsables. Consideraremos implementar un programa en el futuro.

## 📞 Contacto de Seguridad

Para asuntos de seguridad urgentes, contacta:

- **GitHub Security Advisory:** [Crear advisory](https://github.com/JosuIru/comunidad-viva/security/advisories/new)
- **Email:** [Añadir email]
- **GPG Key:** [Añadir GPG key si aplica]

---

**Última actualización:** Enero 2025

Gracias por ayudarnos a mantener Comunidad Viva segura para todos. 🙏
