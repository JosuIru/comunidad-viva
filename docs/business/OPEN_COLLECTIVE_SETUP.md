# 💰 Guía de Configuración - Open Collective

**Objetivo:** Configurar transparencia financiera radical y recibir donaciones globales

**Tiempo estimado:** 2-3 horas

**URL objetivo:** `opencollective.com/comunidad-viva`

---

## 🎯 ¿Por qué Open Collective?

**Ventajas:**
- ✅ **Transparencia total**: Todas las transacciones públicas
- ✅ **Sin entidad legal**: Puedes empezar sin cooperativa/fundación
- ✅ **Fiscal sponsorship**: Open Collective actúa como fiscal host
- ✅ **Pagos globales**: Stripe, PayPal, transferencias, crypto
- ✅ **Facturas automáticas**: Para sponsors empresariales
- ✅ **Reportes públicos**: Trimest rales automáticos
- ✅ **Usado por grandes**: Vue.js, Webpack, Babel lo usan

**Alternativas consideradas:**
- GitHub Sponsors: Menos transparente, más cerrado
- Patreon: Orientado a creadores individuales, no proyectos
- Ko-fi: Simple pero menos features para OSS
- Liberapay: Bueno pero menos conocido

---

## 📋 Paso 1: Crear Cuenta (15 min)

### 1.1 Registro inicial

1. Ve a https://opencollective.com
2. Click "Create a Collective"
3. Selecciona **"Open Source Project"**
4. Completa:
   ```
   Name: Comunidad Viva
   Slug: comunidad-viva (será la URL)
   Website: https://github.com/tu-usuario/comunidad-viva
   Description: Open-source platform for local cooperative economies
   ```

### 1.2 Elegir Fiscal Host

**Recomendado:** Open Source Collective (gratuito para OSS)

Requisitos:
- Proyecto 100% open-source (✓)
- Licencia OSI-approved (AGPL-3.0 ✓)
- Código en GitHub público (✓)

Comisión:
- 10% de donaciones (estándar industria)
- Cubre: entidad legal, compliance, soporte, plataforma

Aplicar:
1. Click "Apply to Open Source Collective"
2. Completa formulario (5 min)
3. Aprobación: 3-5 días hábiles

**Alternativa europea:** Open Collective Europe
- Si prefieres entidad europea
- Mismas condiciones
- Mejor para SEPA transfers

---

## 🎨 Paso 2: Personalizar Página (30 min)

### 2.1 Logo y branding

Preparar:
- Logo: 200x200px PNG (fondo transparente)
- Cover image: 1500x500px
- Favicon: 32x32px

Subir en: Settings → Profile → Images

### 2.2 Descripción detallada

Template sugerido:

```markdown
# 🌱 Comunidad Viva

**Plataforma de código abierto para economías locales cooperativas**

## ¿Qué es?

Comunidad Viva es una plataforma libre (AGPL-3.0) que permite a comunidades locales crear sus propias economías colaborativas donde la ayuda mutua, el intercambio de tiempo y los créditos locales coexisten.

## Características

- 💝 Ayuda mutua y banco de tiempo
- 🗳️ Gobernanza democrática (Proof of Help)
- 🔄 Economía de flujo con multiplicadores
- 🤝 Gestión de comunidades cooperativas
- 🎮 Gamificación ética

## ¿Para qué usamos los fondos?

**100% transparencia. Cada euro se rastrea públicamente.**

- 🖥️ Servidores y hosting (€300/mes)
- 💻 Desarrollo y mantenimiento (€2,000/mes)
- 📚 Documentación y traducción (€200/mes)
- 🎓 Eventos comunitarios (€500/trimestre)
- 🛡️ Buffer de emergencias (3-6 meses)

## Nuestros valores

- Sin ánimo de lucro
- Gobernanza comunitaria
- Datos en manos de usuarios
- Sostenibilidad sobre crecimiento
- Acceso universal (si no puedes pagar, úsalo igual)

## Impacto hasta ahora

- 🏘️ X comunidades activas
- 👥 X usuarios
- 🌍 X países
- 💰 €X,XXX en transacciones locales facilitadas
- ⏱️ X,XXX horas de ayuda mutua registradas

## Links

- 🔗 Código: https://github.com/tu-usuario/comunidad-viva
- 📖 Docs: https://docs.comunidad-viva.org
- 💬 Chat: https://matrix.to/#/#comunidad-viva:matrix.org
- 🌐 Demo: https://demo.comunidad-viva.org

---

**¿Este proyecto te resulta útil?** Considera apoyarlo. Si no puedes económicamente, también ayuda:
- ⭐ Star en GitHub
- 💬 Únete a la comunidad
- 📝 Mejora la documentación
- 🐛 Reporta bugs
- 🌍 Difunde el proyecto
```

### 2.3 Agregar miembros del equipo

Settings → Team:
- Agregar tu cuenta como Admin
- Agregar futuros co-maintainers como Members
- Roles claros en cada perfil

---

## 💳 Paso 3: Configurar Tiers de Contribución (45 min)

### Estructura sugerida:

#### Tier 1: Café Mensual ☕
```
Nombre: Café Mensual
Tipo: Recurring (monthly)
Cantidad: €3/mes
Descripción: "El precio de un café. Suficiente para hacer ruido."
Perks:
  - 💚 Badge de "Supporter" en README
  - 📧 Newsletter mensual
  - 🙏 Gratitud infinita
Button: "Invitar un café"
```

#### Tier 2: Supporter 🌟
```
Nombre: Supporter
Tipo: Recurring (monthly)
Cantidad: €10/mes
Descripción: "Apoyo activo al proyecto."
Perks:
  - Todo lo de Café Mensual
  - 🎖️ Badge de "Active Supporter"
  - 💬 Acceso a canal #supporters (updates tempranos)
Button: "Apoyar activamente"
```

#### Tier 3: Sustainer 💪
```
Nombre: Sustainer
Tipo: Recurring (monthly)
Cantidad: €25/mes
Descripción: "Parte esencial de nuestra sostenibilidad."
Perks:
  - Todo lo anterior
  - 🏆 Tu nombre en la página /sponsors
  - 🎤 Invitación a llamadas trimestrales con el equipo
  - 📊 Reporte trimestral detallado
Button: "Sostener el proyecto"
```

#### Tier 4: Comunidad Pequeña 🏘️
```
Nombre: Comunidad Pequeña
Tipo: Recurring (monthly)
Cantidad: €20/mes
Descripción: "Para comunidades de 10-50 miembros."
Perks:
  - 📊 Dashboard en README de comunidades
  - 🎓 1 sesión de onboarding trimestral
  - 🛠️ Soporte técnico prioritario
Button: "Apoyar como comunidad"
```

#### Tier 5: Comunidad Mediana 🏛️
```
Nombre: Comunidad Mediana
Tipo: Recurring (monthly)
Cantidad: €80/mes
Descripción: "Para comunidades de 50-200 miembros."
Perks:
  - Todo lo anterior
  - 🎤 Llamada mensual de soporte
  - 🔧 Feature requests priorizados
  - 📈 Analytics personalizados
Button: "Apoyar como comunidad"
```

#### Tier 6: Institución Básica 🎓
```
Nombre: Institución Básica
Tipo: Recurring (monthly)
Cantidad: €300/mes
Descripción: "Municipios, universidades, ONGs grandes."
Perks:
  - 🏆 Logo en landing page
  - 📞 Soporte directo (email/chat)
  - 🎯 Consultoría estratégica trimestral
  - 📄 Factura para contabilidad
Button: "Sponsor institucional"
```

#### Tier 7: Institución Comprometida 🤝
```
Nombre: Institución Comprometida
Tipo: Recurring (monthly)
Cantidad: €1,000/mes
Descripción: "Partners estratégicos del proyecto."
Perks:
  - Todo lo anterior
  - 🎤 Participación en Steering Committee (voz, no voto automático)
  - 🌟 Co-branding en materiales
  - 📊 KPIs personalizados
  - 🛠️ Desarrollo de features específicas (dentro de roadmap)
Button: "Ser partner estratégico"
```

#### Tier 8: Donación Única 💝
```
Nombre: Donación Única
Tipo: One-time
Cantidad: Custom (sugerido: €5, €25, €100, €500)
Descripción: "Contribución puntual. Cada granito cuenta."
Button: "Donar una vez"
```

### 3.1 Configurar en Open Collective

Para cada tier:
1. Go to: Settings → Tiers → Add Tier
2. Completa todos los campos
3. Tipo: Recurring o One-time
4. Goal: (opcional) "5 supporters" para crear urgencia
5. Visibility: Public
6. Minimum amount: (el sugerido)
7. Flexible amount: Optional (para que puedan dar más)

---

## 📊 Paso 4: Configurar Gastos Transparentes (20 min)

### 4.1 Crear categorías de gastos

Settings → Expense Categories:

```
- 🖥️ Hosting & Infrastructure
- 💻 Development
- 🎨 Design & UX
- 📝 Documentation
- 🌍 Translation
- 🎓 Events & Workshops
- 📢 Marketing & Outreach
- 🛠️ Tools & Services
- 💼 Legal & Administrative
- 🎁 Contributor Rewards
```

### 4.2 Política de gastos

Settings → Policies → Create:

```markdown
# Política de Gastos

## ¿Quién puede solicitar reembolsos?

- Maintainers (automático)
- Contributors recurrentes (con aprobación)
- Proveedores de servicios (con contrato)
- Speakers en eventos

## Límites

- <€100: Aprobación automática de 1 maintainer
- €100-€500: Aprobación de 2 maintainers
- €500-€2,000: Aprobación Steering Committee
- >€2,000: Votación comunitaria

## Qué cubrimos

✅ Servidores y hosting
✅ Herramientas de desarrollo
✅ Dominios y certificados SSL
✅ Viajes a eventos (con justificación)
✅ Diseño y assets profesionales
✅ Traducciones profesionales
✅ Servicios legales necesarios

❌ Hardware personal
❌ Viajes no relacionados
❌ Servicios de lujo
❌ Gastos sin justificación

## Cómo solicitar

1. Submit expense en Open Collective
2. Adjuntar factura/recibo
3. Descripción clara del gasto
4. Cómo beneficia al proyecto
5. Esperar aprobación (1-5 días)

## Reembolsos a contributors

Si contribuiste código/diseño significativo:
- Puedes solicitar compensación justa
- Basada en horas × tarifa consensuada
- Con cap mensual según fondos disponibles
- Transparente y público

Tarifa sugerida: €20-40/hora (según país y experiencia)
```

---

## 💌 Paso 5: Configurar Comunicaciones (15 min)

### 5.1 Emails automáticos

Settings → Emails → Customize:

**Thank you email** (después de donar):
```
Subject: ¡Gracias por apoyar Comunidad Viva! 💚

Hola {name},

¡Tu contribución de {amount} acaba de llegar! 🎉

Gracias por apoyar el desarrollo de tecnología libre para economías cooperativas. Cada euro cuenta para mantener este commons digital vivo y accesible para todos.

## ¿Qué sigue?

- 📊 Puedes seguir nuestras finanzas en tiempo real aquí: {collective_url}
- 💬 Únete a nuestra comunidad: https://matrix.to/#/#comunidad-viva:matrix.org
- ⭐ Dale star en GitHub: https://github.com/tu-usuario/comunidad-viva
- 🗣️ Difunde el proyecto en tus redes

## Transparencia

Tu contribución se usará para:
- 🖥️ Hosting y servidores (€300/mes)
- 💻 Desarrollo activo (€2,000/mes)
- 📚 Documentación y traducción (€200/mes)
- 🎓 Eventos comunitarios (€500/trimestre)

Publicaremos reportes trimestrales detallando cada gasto.

## ¿Tienes ideas?

Queremos saber qué features te gustaría ver, qué mejorar, cómo podemos servir mejor a tu comunidad.

Responde este email o abre un issue en GitHub. ¡Estamos aquí!

Con gratitud y cariño,
El equipo de Comunidad Viva

---
🌱 Software libre para economías justas
🌍 De Euskadi para el mundo
```

### 5.2 Newsletter mensual

- Herramienta: Buttondown (ético) o Sendy (self-hosted)
- Frecuencia: Mensual
- Contenido:
  - Features nuevas
  - Comunidades destacadas
  - Contributors del mes
  - Finanzas transparentes
  - Próximos eventos

Template:
```
# 📬 Comunidad Viva Newsletter - [Mes Año]

## 🚀 Qué Nuevo

[Features, releases]

## 🏘️ Comunidad Destacada

[Case study de 1 comunidad]

## 💻 Contributors del Mes

[Agradecer a 3-5 personas]

## 💰 Transparencia Financiera

Este mes recibimos: €X,XXX
Gastamos: €X,XXX
Balance: €X,XXX

Principales gastos:
- Item 1: €XXX
- Item 2: €XXX

Ver detalle: [link]

## 📅 Próximos Eventos

- Dev sync: [fecha]
- Asamblea: [fecha]
- Workshop: [fecha]

## 🙏 Gracias

Gracias a nuestros X supporters, este proyecto sigue adelante.

Si aún no apoyas y puedes hacerlo: [link]
```

---

## 📈 Paso 6: Widgets y Promoción (15 min)

### 6.1 Badge para README

Open Collective genera badges automáticos:

```markdown
<!-- Backers -->
[![Backers on Open Collective](https://opencollective.com/comunidad-viva/backers/badge.svg)](https://opencollective.com/comunidad-viva#backers)

<!-- Sponsors -->
[![Sponsors on Open Collective](https://opencollective.com/comunidad-viva/sponsors/badge.svg)](https://opencollective.com/comunidad-viva#sponsors)

<!-- Total donated -->
[![Open Collective](https://opencollective.com/comunidad-viva/tiers/badge.svg)](https://opencollective.com/comunidad-viva)
```

### 6.2 Widget en sitio web

Embedable widget:
```html
<script src="https://opencollective.com/comunidad-viva/banner.js"></script>
```

Customizable en: Settings → Widgets

### 6.3 Botones de donación

Agregar en:
- README.md (sección prominente)
- Sitio web (header o footer)
- Documentación (footer)
- Releases de GitHub

---

## 🎯 Paso 7: Primera Campaña (Opcional)

### 7.1 Goal inicial

Settings → Goals:

```
Goal: €3,000/month
Progress bar visible
Description: "Alcanzar sostenibilidad básica para 2 developers part-time + hosting"

Milestones:
- €500/mes → Hosting cubierto ✅
- €1,000/mes → 1 developer 20h/semana
- €2,000/mes → 2 developers 20h/semana
- €3,000/mes → Sostenibilidad + eventos
- €5,000/mes → Tiempo completo + community manager
```

### 7.2 Updates regulares

Post updates cada:
- Release importante
- Hito alcanzado
- Nueva comunidad activa
- Evento o workshop
- Fin de mes (resumen)

Formato:
```markdown
## 🎉 [Título del update]

[Imagen/GIF]

[Párrafo explicativo]

## Impacto

- Métrica 1
- Métrica 2

## ¿Cómo puedes ayudar?

[Call to action]

---
Ver gastos: [link]
```

---

## 📊 Reportes y Transparencia

### Mensual (automático Open Collective):
- Balance actualizado
- Nuevos sponsors
- Gastos aprobados

### Trimestral (manual):
- Reporte detallado (blog post)
- Roadmap review
- Financial forecast
- Comunidades activas
- Contributors spotlight

### Anual:
- Impact report completo
- Auditoría (si supera €50k)
- Plan siguiente año
- Celebración con la comunidad

---

## ✅ Checklist Final

Antes de anunciar públicamente:

- [ ] Collective aprobado por fiscal host
- [ ] 6-8 tiers configurados
- [ ] Descripción completa y atractiva
- [ ] Logo y cover image subidos
- [ ] Política de gastos clara
- [ ] Thank you email personalizado
- [ ] Badges en README
- [ ] Widget en sitio web (si existe)
- [ ] Goal inicial establecido
- [ ] Primer update publicado
- [ ] Equipo agregado
- [ ] Links a GitHub, docs, chat
- [ ] Stripe/PayPal conectados
- [ ] Test de donación funciona

---

## 🎬 Después del Setup

### Primera semana:
- Haz una donación de €5 tú mismo (test)
- Pide a 2-3 amigos que donen €3 (momentum inicial)
- Anuncia en redes sociales
- Post en comunidades relevantes

### Primer mes:
- Publicar 2-3 updates
- Responder a cada donante (email personal)
- Celebrar hitos públicamente
- Solicitar primer gasto (hosting)

### Primer trimestre:
- Reporte financiero completo
- Caso de éxito de 1 comunidad
- Roadmap actualizado
- Agradecer a todos los supporters por nombre

---

## 💡 Tips de Sostenibilidad

1. **Diversifica fuentes**:
   - 60% individuos
   - 30% instituciones
   - 10% grants

2. **Pide en momentos clave**:
   - Después de releases importantes
   - Cuando compartes caso de éxito
   - En aniversarios del proyecto

3. **No te avergüences**:
   - Desarrollar software libre es trabajo
   - Mereces sustento digno
   - Transparencia genera confianza

4. **Reconoce a todos**:
   - No solo €€€, también código, docs, difusión
   - Cultura de gratitud

5. **Mide y comparte**:
   - Impacto cuantificable
   - Historias cualitativas
   - Transparencia radical

---

<p align="center">
  <strong>¡Configuración completa!</strong>
  <br>
  <em>Ahora tienes infraestructura financiera transparente y ética.</em>
</p>

<p align="center">
  💚 Hecho con amor para el commons
  <br>
  Febrero 2025
</p>
