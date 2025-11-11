# 🚀 Plan de Lanzamiento - Comunidad Viva

**Objetivo:** Liberar el proyecto como software libre y construir una comunidad global sostenible

**Timeline:** 12 semanas (3 meses)

**Fecha inicio estimada:** Marzo 2025

---

## 📋 Resumen Ejecutivo

Este plan guía la transición de Comunidad Viva de un proyecto personal a un **commons digital global** gestionado por su comunidad.

**Hitos clave:**
- ✅ Semana 2: Código limpio y documentado
- ✅ Semana 4: Infraestructura comunitaria activa
- ✅ Semana 6: Contenidos de lanzamiento listos
- ✅ Semana 8: Primera comunidad externa de contributors
- ✅ Semana 10: Lanzamiento público
- ✅ Semana 12: Primera asamblea comunitaria

---

## 🗓️ Cronograma Detallado

### **FASE 1: PREPARACIÓN** (Semanas 1-2)

#### Semana 1: Limpieza y Documentación Base

**Lunes-Martes: Limpieza de código**
- [ ] Revisar historial de git para secretos expuestos
  ```bash
  git log --all --full-history --source --find-object=$(git hash-object /path/to/.env)
  ```
- [ ] Usar `git-filter-repo` si es necesario
- [ ] Crear `.env.example` con todas las variables (valores dummy)
- [ ] Asegurar que `.gitignore` cubre todo lo sensible
- [ ] Remover comentarios TODO personales o referencias internas

**Miércoles-Jueves: Licencia y archivos legales**
- [ ] Cambiar LICENSE de MIT a **AGPL-3.0**
  - Razón: Evitar que corporaciones cierren el código
  - [Texto oficial AGPL](https://www.gnu.org/licenses/agpl-3.0.txt)
- [ ] Crear `CODE_OF_CONDUCT.md` (usar Contributor Covenant)
- [ ] Crear `CONTRIBUTING.md` (ver template abajo)
- [ ] Crear `SECURITY.md` (política de reportes de seguridad)
- [ ] Actualizar headers de archivos con licencia AGPL

**Viernes-Sábado: README épico**
- [ ] Actualizar README.md principal (fusionar con plantilla de este plan)
- [ ] Agregar badges: license, stars, issues, build status
- [ ] Sección "Why AGPL?" clara
- [ ] Links a toda la documentación
- [ ] Screenshots/GIFs de la app funcionando
- [ ] Sección de instalación paso a paso testada

**Domingo: Revisión**
- [ ] Probar instalación desde cero en máquina limpia
- [ ] Verificar que todos los links funcionan
- [ ] Spell-check de documentación en múltiples idiomas

---

#### Semana 2: Infraestructura Comunitaria

**Lunes-Martes: Comunicación**
- [ ] Crear cuenta de Open Collective
  - URL: opencollective.com/comunidad-viva
  - Configurar tiers (ver sección Open Collective abajo)
  - Conectar cuenta bancaria/Stripe
- [ ] Configurar Matrix space
  - Crear #general, #development, #users, #governance
  - Escribir descripción y reglas de cada canal
  - Configurar moderación básica
- [ ] Alternativa: Discord si la comunidad inicial prefiere
  - Canales similares
  - Bot de bienvenida

**Miércoles-Jueves: GitHub**
- [ ] Activar GitHub Discussions
  - Categorías: Announcements, Ideas, Q&A, Show & Tell, Governance
- [ ] Crear templates de issues:
  - Bug report
  - Feature request
  - Question
  - Add community to map
- [ ] Crear template de PR
- [ ] Configurar GitHub Actions:
  - CI/CD en cada PR (tests, lint, build)
  - Labeler automático
  - Stale bot para issues/PRs antiguos
- [ ] Habilitar GitHub Sponsors (opcional, además de Open Collective)
- [ ] Crear org en GitHub (si no existe): `comunidad-viva`

**Viernes-Sábado: Sitio web básico**
- [ ] Registrar dominio: `comunidad-viva.org`
- [ ] Desplegar landing page simple:
  - Hero con propuesta de valor clara
  - Features principales
  - "Try demo" button
  - "Install guide" button
  - "Join community" button
- [ ] Configurar subdominio para demo: `demo.comunidad-viva.org`
- [ ] Desplegar instancia demo con datos seed

**Domingo: Testing**
- [ ] Invitar 2-3 amigos cercanos para feedback
- [ ] Probar todo el flujo: encontrar repo → leer docs → instalar → unirse a chat
- [ ] Iterar basado en confusiones

---

### **FASE 2: CONTENIDOS** (Semanas 3-6)

#### Semana 3: Video y contenido visual

**Lunes-Miércoles: Video demo (3-5 min)**
Guion sugerido:
```
1. Hook (0-15s): "¿Y si existiera una plataforma donde..."
2. Problema (15-45s): Dependencia de dinero tradicional, falta de herramientas
3. Solución (45s-2min): Tour rápido de features
4. Diferencial (2-2:30min): "Por qué esto es diferente (AGPL, sin ánimo de lucro, etc)"
5. Call to action (2:30-3min): "Usa, contribuye, difunde"
```

Herramientas:
- Grabación: OBS Studio (gratis)
- Edición: DaVinci Resolve (gratis) o Shotcut
- Subtítulos: En español, inglés, euskera mínimo
- Publicar: YouTube, PeerTube, GitHub repo
- Thumbnail llamativo

**Jueves-Viernes: Screenshots y GIFs**
- [ ] 10-15 screenshots de features clave
- [ ] 3-5 GIFs animados mostrando flujos
- [ ] Guardar en `/docs/media/`
- [ ] Optimizar imágenes (max 500KB cada una)

**Sábado-Domingo: Case studies**
Escribir 1-2 historias de éxito (pueden ser piloto interno):
- "Cómo el barrio X ahorró €2000 en 3 meses"
- "La cooperativa Y implementó banco de tiempo en 2 semanas"

Formato:
- Problema inicial
- Implementación
- Resultados cuantitativos
- Testimonios
- Lecciones aprendidas

---

#### Semana 4: Contenido escrito

**Lunes-Martes: Blog post de lanzamiento**
Título sugerido: "Liberando Comunidad Viva: Una plataforma para economías locales justas"

Secciones:
1. Por qué creamos esto (personal, honesto)
2. Qué es y qué hace
3. Por qué open-source y AGPL
4. Cómo puedes usar/contribuir
5. Visión a 1-3 años
6. Agradecimientos

Longitud: 1500-2500 palabras
Publicar en: Blog personal, Medium, Dev.to, GitHub

**Miércoles-Jueves: Documentación de usuario**
- [ ] Guía rápida (5 min): Instalar y crear primera comunidad
- [ ] Tutorial completo (30 min): Todas las features principales
- [ ] FAQ: Responder 20-30 preguntas anticipadas
- [ ] Troubleshooting: Errores comunes y soluciones

**Viernes: Documentación para administradores**
- [ ] Guía de instalación en producción
- [ ] Configuración de SSL/dominio
- [ ] Backups y restauración
- [ ] Escalamiento y performance
- [ ] Monitoreo y logs

**Sábado-Domingo: Documentación para developers**
- [ ] Architecture overview (diagrama + explicación)
- [ ] Setup de entorno de desarrollo
- [ ] Convenciones de código
- [ ] Cómo hacer tu primer PR
- [ ] Roadmap de features futuras

---

#### Semana 5-6: Traducción y pulido

**Semana 5: Traducción**
- [ ] Traducir README a inglés (completo)
- [ ] Traducir README a euskera (completo)
- [ ] Traducir CONTRIBUTING.md (EN, EU)
- [ ] Traducir blog post (EN)
- [ ] Traducir subtítulos de video (EN)

**Semana 6: Materiales de difusión**
- [ ] Pitch deck (10 slides):
  - Para presentar en eventos
  - Descargar desde GitHub
- [ ] Infografía resumen (1 página)
- [ ] Tweets pre-escritos (10-15)
- [ ] Post de LinkedIn
- [ ] Email template para contactar:
  - Cooperativas
  - Municipios
  - Organizaciones aliadas

---

### **FASE 3: COMUNIDAD INICIAL** (Semanas 7-8)

#### Semana 7: Primeros contributors

**Objetivo:** Conseguir 5-10 early contributors antes del lanzamiento público

**Cómo:**
- [ ] Invitar directamente a:
  - 2-3 developers conocidos (amigos, ex-colegas)
  - 2-3 activistas/organizadores sociales
  - 1-2 diseñadores
- [ ] Ofrecer:
  - Tour guiado del código (videollamada)
  - Issues etiquetados como "good first issue"
  - Mentoría para su primer PR
  - Reconocimiento como "founding contributor"

**Actividades:**
- [ ] Pair programming session (2-3 horas)
- [ ] Primera dev sync call semanal
- [ ] Crear primeros 20 issues bien descritos
- [ ] Etiquetar issues: `bug`, `enhancement`, `documentation`, `good-first-issue`, `help-wanted`

---

#### Semana 8: Primera comunidad externa

**Objetivo:** Que una comunidad real (no tú) use la plataforma

**Cómo:**
- [ ] Identificar 3-5 comunidades potenciales:
  - Cooperativas pequeñas
  - Grupos de ayuda mutua
  - Ecoaldeas
  - Colectivos vecinales
- [ ] Contactar con oferta:
  - "Usa gratis, te ayudamos a configurar"
  - "Tu feedback moldea el producto"
  - "Serán case study"
- [ ] Sesión de onboarding personalizada (2 horas)
- [ ] Seguimiento semanal primer mes

**Documentar:**
- [ ] Qué funciona bien
- [ ] Qué confunde
- [ ] Qué falta
- [ ] Feature requests
- [ ] Iterar rápido

---

### **FASE 4: LANZAMIENTO** (Semanas 9-10)

#### Semana 9: Soft launch

**Lunes: Anuncio en círculos cercanos**
- [ ] Post en redes personales
- [ ] Email a contactos relevantes
- [ ] Mensaje en grupos de Telegram/WhatsApp
- [ ] Post en comunidades online donde participas

**Martes-Miércoles: Medios alternativos**
- [ ] Artículo en medios cooperativos:
  - Opciones: Canarias Semanal, ElSaltodiario, La Marea
  - Pitch: "Herramienta libre para economías locales"
- [ ] Entrevista en podcast:
  - Opciones: Kale Gorria, En la Frontera, Tecnología Humanista
- [ ] Crosspost en blogs aliados:
  - P2P Foundation
  - Platform Coop Consortium

**Jueves-Viernes: Redes descentralizadas**
- [ ] Post en Mastodon (con hashtags)
- [ ] Foros cooperativos
- [ ] Listas de correo:
  - Cooperativas integrales
  - Municipalismo
  - Decrecimiento

**Sábado-Domingo: Monitorear y responder**
- [ ] Estar atento a preguntas/feedback
- [ ] Responder rápido y amablemente
- [ ] Documentar confusiones comunes

---

#### Semana 10: Lanzamiento público

**Lunes: Show HN (Hacker News)**

Título sugerido:
"Show HN: Comunidad Viva – Open-source platform for local cooperative economies"

Template:
```
Hey HN!

I've been building Comunidad Viva [1], an AGPL-licensed platform for local communities to create their own cooperative economies.

The core idea: most "sharing economy" apps are extractive platforms owned by VCs. What if communities could own their economic infrastructure?

Key features:
- Local credit systems with flow incentives
- Time banking and mutual aid
- Proof-of-Help governance (no pay-to-vote)
- Hybrid economic layers (EUR/credits/gift economy)
- Multi-blockchain bridges (optional)

It's production-ready, fully self-hostable, and designed for real-world communities (we have 2 pilots running).

Why AGPL? To keep this a commons. Anyone can use it, but if you modify and offer as a service, you must share your changes.

Built with: NestJS, Next.js, PostgreSQL, TypeScript.

Would love feedback from HN, especially on:
- Architecture decisions
- How to grow sustainable open-source community
- Governance model (inspired by Apache/Debian but adapted)

[1] https://github.com/tu-usuario/comunidad-viva
[2] Demo: https://demo.comunidad-viva.org
```

**Mejor hora:** 8-9 AM EST (14-15h CET) de lunes-miércoles
**Post:** [Leer guía](https://news.ycombinator.com/newsguidelines.html)

---

**Martes: Reddit**

Subreddits:
- r/opensource
- r/cooperatives
- r/degrowth
- r/collapse (si el enfoque es resiliencia)
- r/basicincome
- r/sustainability
- r/localism

Post adaptado a cada comunidad.

---

**Miércoles: Product Hunt** (opcional)

Si te sientes cómodo con el formato:
- Preparar assets (logo, screenshots, video)
- Conseguir 3-5 "hunters" que den upvote inicial
- Responder preguntas todo el día
- Target: Top 10 del día (realista)

---

**Jueves-Viernes: Tech communities**

- [ ] Dev.to: Blog post técnico
- [ ] Lobste.rs: Technical focus
- [ ] LinkedIn: Post profesional
- [ ] Twitter thread: 8-10 tweets con media
- [ ] Hashtags: #opensource #cooperatives #localeconomy #commons

---

**Sábado-Domingo: Consolidación**

- [ ] Responder todos los comentarios/preguntas
- [ ] Agregar issues reportados
- [ ] Mergear PRs de contributors
- [ ] Post "What we learned launching on HN/Reddit"

---

### **FASE 5: CONSOLIDACIÓN** (Semanas 11-12)

#### Semana 11: Iteración rápida

**Focus:** Responder al feedback del lanzamiento

Actividades:
- [ ] Priorizar issues reportados
- [ ] Fix bugs críticos (en 24-48h)
- [ ] Mejorar docs donde la gente se confundió
- [ ] Agregar features solicitadas (pequeñas y rápidas)
- [ ] Publicar release v1.0.0 si aún no lo es

**Comunicación:**
- [ ] Update semanal en blog
- [ ] Newsletter (si hay lista)
- [ ] Agradecer públicamente a contributors

---

#### Semana 12: Primera asamblea comunitaria

**Evento:** Primera asamblea pública del proyecto

**Agenda (2 horas):**
1. Bienvenida y presentaciones (15 min)
2. Estado del proyecto (15 min):
   - Métricas: stars, forks, issues, PRs
   - Comunidades usando
   - Finanzas actuales
3. Roadmap Q2 (30 min):
   - Propuestas de features
   - Votación de prioridades
4. Gobernanza (30 min):
   - Discusión del modelo
   - Nominaciones para steering committee
5. Q&A abierto (20 min)
6. Próximos pasos (10 min)

**Logística:**
- Plataforma: Jitsi (open-source) o Zoom
- Hora: Buscar consenso (encuesta previa)
- Grabar y publicar
- Notas/actas en GitHub

---

## 📊 Métricas de Éxito

### Fin de Semana 12 (3 meses):

**Código y Comunidad:**
- ⭐ 100+ stars en GitHub
- 🍴 10+ forks
- 👥 10+ contributors (al menos 1 commit cada uno)
- 📝 30+ issues cerrados
- 🔀 15+ PRs mergeados

**Adopción:**
- 🏘️ 5+ comunidades usando en producción
- 👤 200+ usuarios reales registrados
- 🌍 3+ países representados

**Sostenibilidad:**
- 💰 €500-1,000/mes en donaciones recurrentes
- 📧 100+ personas en newsletter
- 💬 50+ miembros activos en chat
- 🎓 1 grant aplicado (resultado pending)

**Alcance:**
- 📰 3+ menciones en medios
- 🎙️ 1+ podcast/entrevista
- 🐦 500+ seguidores redes sociales
- 📊 3,000+ visitas web/mes

---

## 🛠️ Herramientas Necesarias

### Gratuitas:
- GitHub (org gratuita para open-source)
- Matrix/Element (chat)
- Jitsi (videollamadas)
- Open Collective (gestión financiera)
- Cloudflare Pages (hosting landing)
- OBS Studio (video)
- DaVinci Resolve (edición)
- Canva Free (diseño)

### De pago (opcional):
- Dominio: €10/año
- VPS para demo: €5-10/mes
- Zoom Pro: €15/mes (si Matrix no funciona)
- Mailchimp: €0-15/mes (depende tamaño lista)

**Total mínimo:** €25-50/mes

---

## 🎯 Principios del Lanzamiento

### 1. **Autenticidad sobre Marketing**
- No exageramos features
- Somos honestos sobre limitaciones
- "MVP funcional" no "producto perfecto"

### 2. **Comunidad sobre Números**
- 10 contributors comprometidos > 1000 stars pasivos
- Conversaciones profundas > viralidad superficial

### 3. **Sostenibilidad sobre Velocidad**
- Ritmo que podemos mantener
- No burnout por lanzamiento

### 4. **Aprendizaje sobre Perfección**
- Lanzamos para aprender
- Iteramos basado en feedback real
- Está bien cambiar de dirección

---

## 🚨 Risks y Mitigaciones

### Risk 1: Nadie contribuye
**Mitigación:**
- Issues muy bien descritos
- Mentoría activa primeros contributors
- Celebrar cada contribución públicamente
- Hacerlo fácil y acogedor

### Risk 2: Finanzas insuficientes
**Mitigación:**
- No depender de ingresos inicial
- Aplicar a múltiples grants
- Servicios profesionales como backup
- Transparencia sobre necesidades

### Risk 3: Falta de adopción
**Mitigación:**
- Onboarding personal primeras 10 comunidades
- Iterar rápido basado en feedback
- Documentación excelente
- Demo funcional siempre disponible

### Risk 4: Burnout del fundador
**Mitigación:**
- Buscar co-maintainers rápido
- Documentar todo (no conocimiento en tu cabeza)
- Establecer límites claros (horarios, descansos)
- Pedir ayuda cuando la necesites

---

## 📞 Soporte Durante el Lanzamiento

Si necesitas ayuda, pide en:
- 💬 Matrix: #launch-2025
- 📧 Email: hola@comunidad-viva.org
- 🐦 Twitter: @comunidad_viva

**Recuerda:** Lanzar es duro, pero lo estás haciendo por las razones correctas. Este proyecto puede cambiar vidas.

---

## ✅ Checklist Final Pre-Lanzamiento

Antes de hacer "Show HN", verifica:

- [ ] README es claro y atractivo
- [ ] LICENSE es AGPL-3.0
- [ ] CODE_OF_CONDUCT existe
- [ ] CONTRIBUTING.md existe
- [ ] SECURITY.md existe
- [ ] Demo funciona sin fallos
- [ ] Video demo está subido y subtitulado
- [ ] Open Collective configurado
- [ ] Chat comunitario activo (Matrix/Discord)
- [ ] GitHub Discussions habilitado
- [ ] 10+ issues "good-first-issue" creados
- [ ] CI/CD funciona
- [ ] No hay secrets en el código
- [ ] .env.example está actualizado
- [ ] Instalación funciona en máquina limpia
- [ ] Al menos 2 personas testearon el flujo completo

---

<p align="center">
  <strong>¡Estás listo para cambiar el mundo!</strong>
  <br>
  <em>Recuerda: El lanzamiento es el inicio, no el fin.</em>
</p>

<p align="center">
  🌱 Creado con amor para el commons
  <br>
  Febrero 2025
</p>
