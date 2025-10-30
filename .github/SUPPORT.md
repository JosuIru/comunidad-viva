# 🆘 Soporte y Recursos de Ayuda

¿Necesitas ayuda con **Comunidad Viva**? ¡Estamos aquí para ayudarte!

## 📚 Recursos Disponibles

### Documentación

Antes de pedir ayuda, consulta nuestra documentación:

- **[📖 README](../README.md)** - Visión general del proyecto
- **[🚀 Quick Start](../QUICK_START.md)** - Guía rápida de inicio
- **[📖 API Reference](../API_REFERENCE.md)** - Documentación completa de la API
- **[🤝 Contributing](../CONTRIBUTING.md)** - Guía de contribución
- **[🔒 Security](../SECURITY.md)** - Política de seguridad
- **[🌍 Multilenguaje](../packages/web/MULTILENGUAJE.md)** - Sistema i18n

### Documentación Técnica Específica

- **[Sistema Híbrido](../packages/backend/src/hybrid/README.md)** - Capas económicas
- **[Gobernanza](../CONSENSUS_GOVERNANCE_GUIDE.md)** - Proof of Help
- **[Changelog](../CHANGELOG.md)** - Historial de cambios

## 💬 Canales de Comunicación

### 1. GitHub Discussions 💡

**Ideal para:** Preguntas generales, discusiones, ideas

- [Crear una discusión](https://github.com/JosuIru/comunidad-viva/discussions)
- Categorías disponibles:
  - 💬 General
  - 💡 Ideas
  - 🙏 Q&A
  - 🎉 Show and Tell

### 2. GitHub Issues 🐛

**Ideal para:** Bugs, features específicos, problemas técnicos

- [Reportar un bug](https://github.com/JosuIru/comunidad-viva/issues/new?template=bug_report.md)
- [Solicitar una funcionalidad](https://github.com/JosuIru/comunidad-viva/issues/new?template=feature_request.md)
- [Hacer una pregunta](https://github.com/JosuIru/comunidad-viva/issues/new?template=question.md)

### 3. Stack Overflow 📚

**Ideal para:** Preguntas técnicas de programación

- Tag: `comunidad-viva`
- Incluye código relevante y logs
- [Buscar preguntas existentes](https://stackoverflow.com/questions/tagged/comunidad-viva)

## 🔍 Antes de Pedir Ayuda

### Checklist de Auto-ayuda

- [ ] ¿He leído la documentación relevante?
- [ ] ¿He buscado en issues existentes?
- [ ] ¿He consultado las discussions?
- [ ] ¿He actualizado a la última versión?
- [ ] ¿He revisado los logs de error?

### Información Útil para Reportar

Cuando pidas ayuda, incluye:

```
**Entorno:**
- OS: [ej. Ubuntu 22.04]
- Node.js: [ej. 18.17.0]
- Versión de la app: [ej. 1.0.0]
- Navegador: [ej. Chrome 120]

**Descripción del problema:**
[Describe claramente el problema]

**Pasos para reproducir:**
1. Paso 1
2. Paso 2
3. ...

**Comportamiento esperado:**
[Qué esperabas que sucediera]

**Comportamiento actual:**
[Qué está sucediendo]

**Logs relevantes:**
```
[Pega aquí logs o mensajes de error]
```

**Screenshots:**
[Si aplica]
```

## 🚀 Problemas Comunes y Soluciones

### 1. Error al instalar dependencias

```bash
# Limpia caché y reinstala
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 2. Error de conexión a base de datos

```bash
# Verifica que PostgreSQL esté corriendo
docker-compose ps

# Revisa la variable DATABASE_URL en .env
cat .env | grep DATABASE_URL

# Reinicia los servicios
docker-compose restart postgres
```

### 3. Puerto ya en uso

```bash
# Backend (4000)
lsof -ti:4000 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### 4. Error de migraciones de Prisma

```bash
# Regenera el cliente de Prisma
cd packages/backend
npx prisma generate

# Aplica migraciones pendientes
npx prisma migrate deploy
```

### 5. Problemas con Docker

```bash
# Reconstruye las imágenes
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📖 Tutoriales y Guías

### Para Nuevos Contribuidores

1. **[First Contributions](https://github.com/firstcontributions/first-contributions)** - Guía para tu primer PR
2. **[Git Guide](https://rogerdudler.github.io/git-guide/)** - Conceptos básicos de Git
3. **[Markdown Guide](https://www.markdownguide.org/)** - Sintaxis de Markdown

### Tecnologías Principales

- **[NestJS Docs](https://docs.nestjs.com/)** - Framework del backend
- **[Next.js Docs](https://nextjs.org/docs)** - Framework del frontend
- **[Prisma Docs](https://www.prisma.io/docs)** - ORM de base de datos
- **[TailwindCSS Docs](https://tailwindcss.com/docs)** - Framework de CSS

## 🤝 Comunidad

### Formas de Contribuir

No solo código - también puedes ayudar:

- 📖 **Mejorar documentación**
- 🌍 **Traducir a otros idiomas**
- 🐛 **Reportar bugs**
- 💡 **Sugerir ideas**
- 🎨 **Diseñar UI/UX**
- 📣 **Compartir el proyecto**
- ⭐ **Dar una estrella en GitHub**

### Código de Conducta

Todos los participantes deben seguir nuestro [Código de Conducta](../CODE_OF_CONDUCT.md).

## 📧 Contacto Directo

### Para asuntos urgentes o privados:

- **Seguridad:** Usa [Security Advisories](https://github.com/JosuIru/comunidad-viva/security/advisories)
- **Otro:** [Crear un issue privado](https://github.com/JosuIru/comunidad-viva/issues)

## 🕐 Tiempos de Respuesta

Somos un proyecto de código abierto con contribuidores voluntarios:

- **Issues:** 24-72 horas (días laborables)
- **Pull Requests:** 3-7 días
- **Security:** 24-48 horas
- **Discussions:** 1-3 días

## 🙏 Agradecimientos

Gracias por usar Comunidad Viva y por ser parte de nuestra comunidad. Tu feedback nos ayuda a mejorar.

---

**¿No encuentras lo que buscas?**

[Abre un issue de pregunta](https://github.com/JosuIru/comunidad-viva/issues/new?template=question.md) y te ayudaremos lo antes posible.
