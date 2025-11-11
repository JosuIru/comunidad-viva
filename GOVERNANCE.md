# 🏛️ Gobernanza del Proyecto Comunidad Viva / Truk

**Versión:** 1.0
**Última actualización:** Febrero 2025
**Estado:** En implementación

---

## 📜 Principios Fundamentales

Este proyecto se gobierna bajo los siguientes principios:

### 1. **Propiedad Colectiva**
- El código pertenece a la comunidad que lo usa y desarrolla
- No hay "dueño" individual, solo custodios temporales
- Las decisiones importantes requieren consenso comunitario

### 2. **Transparencia Radical**
- Todas las decisiones se documentan públicamente
- Todas las conversaciones importantes son abiertas
- Toda la financiación es transparente y auditable
- Los desacuerdos se tratan con respeto y se documentan

### 3. **Meritocracia Suave**
- Quien contribuye, tiene voz
- Pero nadie es excluido de las discusiones
- La experiencia cuenta, pero no domina
- Los nuevos contribuyentes son bienvenidos activamente

### 4. **Consenso sobre Mayoría**
- Buscamos acuerdo amplio antes que votos
- Las minorías tienen voz y protección
- Los conflictos se resuelven con diálogo, no imposición
- El fork amistoso es válido cuando hay diferencias irreconciliables

### 5. **Liderazgo Distribuido y Rotativo**
- Los roles se rotan periódicamente
- El conocimiento se documenta y se distribuye
- Evitamos dependencia de "personas clave"
- Fomentamos la autonomía de los equipos

---

## 👥 Estructura de Roles

### 🌟 Maintainers (Mantenedores)

**Qué hacen:**
- Revisan y aprueban pull requests
- Moderan discusiones técnicas
- Mantienen la calidad del código
- Liberan versiones oficiales
- Tutoría a nuevos contributors

**Cómo se llega:**
- 10+ PRs significativos aceptados
- Conocimiento demostrado del proyecto
- Valores alineados con el proyecto
- Propuesta y voto de maintainers actuales (consenso)

**Responsabilidades:**
- Responder a issues/PRs en 3-5 días hábiles
- Participar en reuniones mensuales
- Documentar decisiones importantes
- Respetar el código de conducta

**Rotación:**
- Rol renovable cada 12 meses
- Puede renunciar en cualquier momento
- Puede ser removido por inactividad (3+ meses) o violaciones del código de conducta

**Maintainers actuales:**
- [@JosuIru] - Fundador, Backend/Full-stack (desde Feb 2025)
- _[Próximos maintainers por agregar]_

---

### 💻 Contributors (Contribuyentes)

**Qué hacen:**
- Contribuyen código, documentación, diseño
- Reportan bugs y sugieren mejoras
- Ayudan en discusiones técnicas
- Revisan PRs de otros

**Cómo se llega:**
- Abriendo tu primer PR aceptado
- Sin requisitos previos

**Privilegios:**
- Después de 3+ PRs aceptados: Acceso de commit directo a branches no-main
- Voz en propuestas técnicas
- Reconocimiento en CONTRIBUTORS.md

---

### 🗳️ Steering Committee (Comité de Dirección)

**Qué hacen:**
- Deciden roadmap estratégico (no código, sino visión)
- Resuelven conflictos no técnicos
- Gestionan finanzas y relaciones externas
- Representan el proyecto en eventos

**Composición:**
- 5-7 personas
- Diversidad obligatoria:
  - 2-3 desarrolladores activos
  - 1-2 usuarios de comunidades reales
  - 1 activista/organizador social
  - 1 diseñador/comunicador
  - Opcional: 1 experto en economía alternativa

**Cómo se elige:**
- Elecciones anuales (cada Enero)
- Candidatos se postulan voluntariamente
- Votación abierta a todos los contributors + comunidades usuarias
- Sistema de votación por rangos (no "winner takes all")

**Duración:**
- 12 meses
- Renovable máximo 2 veces (3 años totales)
- Después debe pasar 1 año antes de volver a postularse

**Reuniones:**
- Mensual, online, abierta al público
- Actas publicadas en GitHub Discussions

**Steering Committee actual:**
- _[Por formar tras el lanzamiento público]_

---

### 🌍 Community Members (Miembros Comunitarios)

**Quiénes son:**
- Cualquier persona que usa la plataforma
- Administradores de comunidades
- Usuarios activos

**Privilegios:**
- Voz en decisiones estratégicas grandes
- Derecho a proponer cambios vía GitHub Discussions
- Participación en encuestas y asambleas
- Voto en elecciones del Steering Committee

**Cómo participar:**
- Únete al chat de Matrix/Discord
- Comenta en GitHub Discussions
- Asiste a asambleas mensuales
- Completa encuestas de feedback

---

## 🛠️ Proceso de Toma de Decisiones

### Decisiones Pequeñas (bugs, mejoras menores)

**Proceso:**
```
1. Abrir issue o PR directamente
2. Revisión por 1 maintainer
3. Aprobación → Merge
```

**Tiempo:** 3-7 días

**Ejemplos:**
- Corregir bug en UI
- Mejorar documentación
- Refactor pequeño
- Agregar tests

---

### Decisiones Medianas (features nuevas)

**Proceso:**
```
1. Abrir issue para discusión
2. Explicar problema, propuesta, alternativas
3. Discusión pública 5-7 días
4. RFC (Request for Comments) si es complejo
5. Consenso de maintainers
6. Implementación vía PR
```

**Tiempo:** 2-4 semanas

**Ejemplos:**
- Nueva funcionalidad grande
- Cambio de UX significativo
- Nueva integración
- Cambio de dependencias importantes

---

### Decisiones Grandes (arquitectura, dirección)

**Proceso:**
```
1. RFC detallado en GitHub Discussions
2. Período de discusión: 14-21 días
3. Asamblea comunitaria para debatir
4. Búsqueda de consenso
5. Si no hay consenso: Votación cuadrática
6. Decisión documentada públicamente
7. Período de 7 días para objeciones críticas
8. Implementación
```

**Tiempo:** 1-3 meses

**Ejemplos:**
- Cambio de licencia
- Migración de tecnología principal
- Modelo de financiación
- Adición de blockchain/crypto
- Partnership con organización
- Cambio de marca/nombre

**Quórum:**
- Mínimo 5 maintainers + 10 contributors + 5 comunidades activas
- Threshold: 66% de apoyo

---

### ⚖️ Sistema de Votación

**Cuándo votar:**
- Solo cuando el consenso es imposible después de buena fe
- Para decisiones grandes únicamente
- La votación es el último recurso, no el primero

**Sistema:**
- **Votación Cuadrática**: Previene dominio de pocos
- Cada persona tiene créditos de voto
- Votar X puntos cuesta X² créditos
- Ejemplo:
  - 1 punto = 1 crédito
  - 5 puntos = 25 créditos
  - 10 puntos = 100 créditos

**Distribución de créditos:**
- Maintainers: 100 créditos
- Contributors con 5+ PRs: 50 créditos
- Contributors con 1-4 PRs: 25 créditos
- Comunidades usuarias: 50 créditos (1 voto por comunidad)
- Steering Committee: 75 créditos

---

## 🔄 Proceso RFC (Request for Comments)

Para cambios técnicos complejos, usamos RFCs:

**Formato:**
```markdown
# RFC-XXX: [Título descriptivo]

## Resumen
[2-3 párrafos]

## Motivación
¿Por qué necesitamos esto?

## Propuesta Detallada
Explicación técnica completa

## Alternativas Consideradas
Qué más exploramos y por qué esto es mejor

## Inconvenientes
Qué problemas trae esto

## Impacto
- En usuarios
- En developers
- En infraestructura
- En comunidades

## Preguntas Abiertas
Qué aún no sabemos
```

**Proceso:**
1. Crear borrador en `rfcs/` directory
2. Abrir PR para el RFC (no código, solo propuesta)
3. Discusión en el PR durante 14-21 días
4. Iteraciones basadas en feedback
5. Votación o consenso
6. Si aprobado: RFC merged + issue para implementación

---

## 🤝 Resolución de Conflictos

### Nivel 1: Conversación Directa
- Las partes intentan resolver directamente
- Con respeto, empatía y buena fe

### Nivel 2: Mediación
- Un maintainer neutral media
- Sesión privada para encontrar solución

### Nivel 3: Steering Committee
- Si los niveles anteriores fallan
- Decisión vinculante del Steering Committee
- Documentación pública del conflicto y resolución

### Nivel 4: Fork Amistoso
- Si el conflicto es irreconciliable
- Apoyamos forks amistosos (ver FORKING_POLICY.md)
- Sin drama, sin resentimiento
- Colaboración futura posible

---

## 📅 Reuniones y Eventos

### Semanales

**Dev Sync** (Lunes 18:00 CET)
- Duración: 30 minutos
- Formato: Video call abierta (Jitsi)
- Agenda:
  - Qué se hizo la semana pasada
  - Qué se hará esta semana
  - Blockers y ayuda necesaria
- Actas: Publicadas en GitHub Discussions

---

### Mensuales

**Asamblea Comunitaria** (Primer viernes del mes, 19:00 CET)
- Duración: 2 horas
- Formato: Video + chat (para diferentes zonas horarias)
- Agenda:
  - Reporte del mes (desarrollo, usuarios, finanzas)
  - Propuestas pendientes
  - Decisiones que requieren input comunitario
  - Q&A abierto
- Grabación disponible públicamente
- Actas en múltiples idiomas

**Contribution Sprint** (Último sábado, 10:00-14:00 CET)
- Trabajo sincronizado en features
- Pair programming
- Onboarding de nuevos contributors
- Documentación colaborativa

---

### Trimestrales

**Roadmap Planning** (Primer mes de cada trimestre)
- Decidir prioridades próximos 3 meses
- Revisión de roadmap anual
- Asignación de recursos (tiempo, dinero, personas)
- Online via Zoom + Miro/Mural

**Reporte Financiero** (Fin de cada trimestre)
- Reporte transparente de ingresos y gastos
- Plan financiero próximo trimestre
- Publicado en Open Collective + GitHub

---

### Anuales

**UnConference Presencial** (Verano, ciudad rotatoria)
- 2 días de encuentro en persona
- No agenda fija, propuestas emergentes
- Espacios:
  - Desarrollo técnico
  - Visión y estrategia
  - Economía y sostenibilidad
  - Arte y comunidad
- Financiación vía crowdfunding
- Becas de viaje para quienes no pueden pagar

**Elecciones Steering Committee** (Enero)
- Proceso electoral descrito arriba
- 2 semanas de campaña
- 1 semana de votación
- Asunción nuevos miembros: Febrero 1

---

## 💰 Gobernanza Financiera

### Transparencia
- Todas las transacciones públicas en Open Collective
- Reportes trimestrales detallados
- Dashboard en vivo de finanzas
- Auditoría anual (cuando supere €50,000/año)

### Presupuesto
**Aprobación de gastos:**
- < €100: Maintainers pueden aprobar
- €100-€1,000: Steering Committee aprueba
- €1,000-€5,000: Votación de contributors
- > €5,000: Asamblea comunitaria decide

### Salarios
Si el proyecto genera suficiente financiación estable:
- Salarios equitativos (no diferencias extremas)
- Basados en coste de vida y horas de dedicación
- Publicados transparentemente
- Revisados anualmente

**Propuesta inicial (si se llega):**
- Developer full-time: €2,500-3,500/mes (según país)
- Developer part-time: €1,000-1,500/mes
- Diseñador/comunicador: €1,500-2,000/mes
- Community manager: €1,000-1,500/mes

Objetivos: Suficiencia digna, no acumulación.

---

## 🔒 Código de Conducta

Ver [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

**Aplicación:**
- Violaciones menores: Advertencia privada
- Violaciones repetidas: Advertencia pública
- Violaciones graves: Suspensión temporal
- Violaciones muy graves: Expulsión permanente

**Proceso:**
- Reporte a conduct@comunidad-viva.org
- Revisión por 3 maintainers (no involucrados)
- Decisión en 7 días
- Apelación posible al Steering Committee

---

## 📊 Métricas de Salud del Proyecto

Monitoreamos trimestralmente:

### Técnicas
- ⭐ Stars en GitHub
- 🍴 Forks
- 📝 PRs abiertos vs cerrados
- 🐛 Bugs abiertos vs cerrados
- ⏱️ Tiempo medio de respuesta a issues
- 👥 Contributors activos (1+ commit/trimestre)

### Comunitarias
- 💬 Participación en asambleas
- 🗳️ Participación en votaciones
- 💰 Sponsors activos
- 🌍 Comunidades usando en producción
- 🌐 Contribuciones no-código (docs, traducciones, diseño)

### Financieras
- 💵 Ingresos mensuales recurrentes
- 💸 Gastos mensuales
- 📈 Buffer financiero (meses de runway)
- 🎓 Grants activos

**Objetivos saludables (año 2):**
- 50+ contributors
- 20+ commits/mes
- 10+ comunidades en producción
- €3,000+/mes ingresos sostenibles
- 3-6 meses buffer financiero

---

## 🌱 Evolución de esta Gobernanza

Este documento es **vivo y evolutivo**.

**Para proponer cambios:**
1. Abrir issue con etiqueta `[governance]`
2. Discusión mínimo 21 días
3. RFC si el cambio es grande
4. Asamblea comunitaria para decidir
5. Requiere 75% de apoyo (quórum alto)

**Revisión obligatoria:**
- Cada 12 meses
- Después de cada crisis mayor
- Cuando el proyecto cambia de tamaño (×2 o ×10)

---

## 📞 Contacto para Gobernanza

- 💭 **Propuestas**: [GitHub Discussions - Governance](https://github.com/tu-usuario/comunidad-viva/discussions/categories/governance)
- 📧 **Privado**: governance@comunidad-viva.org
- 💬 **Chat**: #governance en Matrix

---

## 🙏 Inspiración

Esta gobernanza se inspira en:
- **Apache Software Foundation** - Meritocracia abierta
- **Debian** - Consenso y voluntarios
- **Wikipedia** - Commons colaborativos
- **Loomio** - Toma de decisiones participativa
- **Enspiral** - Liderazgo distribuido
- **DisCO Coop** - Feminismo económico

---

<p align="center">
  <em>"La mejor gobernanza es la que se hace invisible porque la comunidad
  <br>se ha cuidado tanto que las decisiones fluyen naturalmente."</em>
</p>

<p align="center">
  Versión 1.0 - Febrero 2025
  <br>
  Documento vivo, en evolución permanente
</p>
