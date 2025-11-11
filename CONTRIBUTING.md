# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Truk! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Guías de Estilo](#guías-de-estilo)
- [Proceso de Pull Request](#proceso-de-pull-request)

## 📜 Código de Conducta

Este proyecto se adhiere a un Código de Conducta. Al participar, se espera que mantengas este código. Por favor, reporta comportamientos inaceptables abriendo un issue.

### Nuestros Estándares

- **Sé respetuoso:** Trata a todos con respeto y consideración
- **Sé constructivo:** Proporciona feedback constructivo y útil
- **Sé colaborativo:** Trabaja en equipo y comparte conocimientos
- **Sé inclusivo:** Damos la bienvenida a personas de todos los orígenes

## 🎯 ¿Cómo puedo contribuir?

### 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un issue con:

- **Título descriptivo:** Resume el problema en una línea
- **Descripción detallada:** Explica el problema con el mayor detalle posible
- **Pasos para reproducir:** Lista los pasos exactos para reproducir el bug
- **Comportamiento esperado:** Describe qué esperabas que sucediera
- **Comportamiento actual:** Describe qué sucede realmente
- **Screenshots:** Si es aplicable, añade capturas de pantalla
- **Entorno:**
  - OS: [ej. Ubuntu 22.04]
  - Node.js: [ej. 18.17.0]
  - Navegador: [ej. Chrome 120]

### 💡 Sugerir Mejoras

Las sugerencias de mejoras son bienvenidas. Por favor:

1. **Verifica si ya existe:** Busca en los issues existentes
2. **Describe la mejora:** Explica claramente qué quieres añadir/cambiar
3. **Justifica el cambio:** Explica por qué sería útil
4. **Proporciona ejemplos:** Muestra cómo funcionaría

### 🎨 Contribuir con Código

#### Áreas donde puedes contribuir:

- **Features nuevos:** Implementa nuevas funcionalidades
- **Bug fixes:** Arregla errores existentes
- **Documentación:** Mejora la documentación
- **Tests:** Añade o mejora tests
- **Refactoring:** Mejora el código existente
- **Traducciones:** Añade soporte para nuevos idiomas
- **UI/UX:** Mejora la interfaz de usuario

## 🛠️ Configuración del Entorno

### Prerequisitos

- Node.js 18+
- Docker & Docker Compose
- Git
- Editor de código (recomendamos VS Code)

### Setup Inicial

```bash
# 1. Fork el repositorio en GitHub

# 2. Clona tu fork
git clone https://github.com/TU_USUARIO/comunidad-viva.git
cd comunidad-viva

# 3. Añade el repositorio original como upstream
git remote add upstream https://github.com/JosuIru/comunidad-viva.git

# 4. Instala dependencias
make install

# 5. Copia las variables de entorno
cp .env.example .env

# 6. Levanta el entorno de desarrollo
make dev

# 7. En otra terminal, ejecuta las migraciones y seed
make migrate
make seed
```

### Verificar que todo funciona

```bash
# Backend: http://localhost:4000
# Frontend: http://localhost:3000

# Ejecuta los tests
make test
```

## 🔄 Flujo de Trabajo

### 1. Crea una rama

```bash
# Actualiza tu main con los últimos cambios
git checkout main
git pull upstream main

# Crea una nueva rama
git checkout -b tipo/descripcion-breve

# Tipos de ramas:
# - feature/nombre-feature
# - bugfix/nombre-bug
# - hotfix/nombre-hotfix
# - docs/descripcion
# - refactor/descripcion
```

### 2. Haz tus cambios

- Escribe código limpio y legible
- Sigue las guías de estilo del proyecto
- Añade tests para tu código
- Actualiza la documentación si es necesario
- Haz commits frecuentes y descriptivos

### 3. Commits

Usamos **Conventional Commits**:

```bash
# Formato
tipo(scope): descripción breve

# Tipos válidos:
# - feat: Nueva funcionalidad
# - fix: Bug fix
# - docs: Cambios en documentación
# - style: Cambios de formato (no afectan el código)
# - refactor: Refactorización de código
# - test: Añadir o modificar tests
# - chore: Cambios en build, dependencias, etc

# Ejemplos:
git commit -m "feat(hybrid): add new economic layer CHAMELEON"
git commit -m "fix(auth): resolve JWT token expiration bug"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(offers): add unit tests for offer creation"
```

### 4. Push y Pull Request

```bash
# Push a tu fork
git push origin tipo/descripcion-breve

# Luego ve a GitHub y crea un Pull Request
```

## 📝 Guías de Estilo

### TypeScript

```typescript
// ✅ Bueno
export class UserService {
  async findUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }
}

// ❌ Malo
export class UserService {
  async findUserById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### Naming Conventions

- **Variables y funciones:** `camelCase`
- **Clases e interfaces:** `PascalCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Archivos:** `kebab-case.ts` o `PascalCase.tsx` (componentes React)

### Comentarios

```typescript
// Comentarios en español o inglés, consistente en todo el archivo

/**
 * Crea una nueva oferta en el sistema
 * @param userId - ID del usuario que crea la oferta
 * @param data - Datos de la oferta
 * @returns La oferta creada
 */
async createOffer(userId: string, data: CreateOfferDto): Promise<Offer> {
  // Validar que el usuario existe
  const user = await this.findUser(userId);

  // Crear la oferta
  return await this.prisma.offer.create({
    data: { ...data, userId },
  });
}
```

### React/Next.js

```tsx
// ✅ Bueno - Componente funcional con tipos
interface Props {
  title: string;
  onClose: () => void;
}

export default function Modal({ title, onClose }: Props) {
  return (
    <div className="modal">
      <h2>{title}</h2>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}

// ❌ Malo - Sin tipos
export default function Modal({ title, onClose }) {
  return (
    <div className="modal">
      <h2>{title}</h2>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}
```

### CSS/TailwindCSS

```tsx
// ✅ Bueno - Clases ordenadas y agrupadas
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Click me
</button>

// ❌ Malo - Clases desordenadas
<button className="text-white bg-blue-600 py-2 rounded-lg hover:bg-blue-700 px-4 transition-colors">
  Click me
</button>
```

### Tests

```typescript
describe('OfferService', () => {
  describe('createOffer', () => {
    it('should create a new offer successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const offerData = { title: 'Test Offer', price: 100 };

      // Act
      const result = await service.createOffer(userId, offerData);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe('Test Offer');
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      const userId = 'non-existent';
      const offerData = { title: 'Test', price: 100 };

      // Act & Assert
      await expect(
        service.createOffer(userId, offerData)
      ).rejects.toThrow('User not found');
    });
  });
});
```

## 🔍 Proceso de Pull Request

### Antes de enviar

- [ ] El código compila sin errores
- [ ] Todos los tests pasan
- [ ] Has añadido tests para tu código
- [ ] La documentación está actualizada
- [ ] El código sigue las guías de estilo
- [ ] Los commits siguen Conventional Commits
- [ ] Has probado manualmente los cambios

### Descripción del PR

```markdown
## 📝 Descripción

Breve descripción de los cambios

## 🎯 Motivación y Contexto

¿Por qué es necesario este cambio? ¿Qué problema resuelve?

Cierra #(número de issue)

## 🔨 Cambios Realizados

- Cambio 1
- Cambio 2
- Cambio 3

## 📸 Screenshots (si aplica)

[Añade screenshots si hay cambios visuales]

## ✅ Checklist

- [ ] Tests añadidos/actualizados
- [ ] Documentación actualizada
- [ ] Código revisado
- [ ] Changelog actualizado (si aplica)

## 🧪 ¿Cómo se ha probado?

Describe las pruebas que realizaste:
- [ ] Test unitarios
- [ ] Test de integración
- [ ] Prueba manual en navegador
- [ ] Prueba en móvil

## 📱 Entorno de Prueba

- OS: [ej. Ubuntu 22.04]
- Node.js: [ej. 18.17.0]
- Navegador: [ej. Chrome 120]
```

### Revisión del Código

Tu PR será revisado por los mantenedores. Puede que:

- Aprueben y mergeen inmediatamente
- Pidan cambios o mejoras
- Inicien una discusión sobre el enfoque

**Sé paciente y receptivo al feedback** 🙏

### Después del Merge

1. Actualiza tu fork:
```bash
git checkout main
git pull upstream main
git push origin main
```

2. Elimina la rama (opcional):
```bash
git branch -d tipo/descripcion-breve
git push origin --delete tipo/descripcion-breve
```

## 🌍 Traducciones

Para añadir un nuevo idioma:

1. Crea archivos de traducción en `packages/web/messages/`:
```bash
# Ejemplo para francés
cp packages/web/messages/es.json packages/web/messages/fr.json
```

2. Traduce todo el contenido del archivo

3. Actualiza la configuración en `packages/web/i18n.ts`:
```typescript
export const locales = ['es', 'eu', 'fr'] as const;
```

4. Actualiza `LanguageSelector.tsx` para incluir el nuevo idioma

5. Documenta en `MULTILENGUAJE.md`

## 📚 Recursos Útiles

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🎓 Primeras Contribuciones

¿Es tu primera vez contribuyendo a un proyecto open source? ¡Bienvenido!

Busca issues etiquetados como:
- `good first issue` - Buenos para empezar
- `help wanted` - Necesitamos ayuda
- `beginner friendly` - Fáciles de resolver

## 💬 Preguntas

¿Tienes preguntas? No dudes en:
- Abrir un issue con la etiqueta `question`
- Comentar en un issue existente
- Contactar a los mantenedores

## 🙏 Agradecimientos

¡Gracias por contribuir a Truk! Cada contribución, por pequeña que sea, hace que este proyecto sea mejor.

---

**Happy Coding! 🚀**
