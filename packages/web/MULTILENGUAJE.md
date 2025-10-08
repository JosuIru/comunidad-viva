# Guía de Multilenguaje 🌍

La aplicación ahora soporta múltiples idiomas gracias a **next-intl**. Actualmente disponibles:
- 🇪🇸 **Castellano** (es) - idioma por defecto
- 🏴 **Euskera** (eu)

## Estructura de archivos

```
packages/web/
├── messages/
│   ├── es.json          # Traducciones en castellano
│   └── eu.json          # Traducciones en euskera
├── i18n.ts              # Configuración de i18n
├── src/
│   ├── middleware.ts    # Middleware para detectar idioma
│   ├── hooks/
│   │   └── useI18n.ts   # Hook personalizado para traducciones
│   └── components/
│       └── LanguageSelector.tsx  # Selector de idioma
```

## Cómo usar traducciones en tus componentes

### 1. Importar el hook

```tsx
import { useTranslations } from 'next-intl';
```

### 2. Usar en el componente

```tsx
export default function MiComponente() {
  const t = useTranslations('nav');

  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href="/offers">{t('offers')}</Link>
    </div>
  );
}
```

### 3. Ejemplo completo - Actualizar Navbar

Para actualizar el Navbar existente, reemplaza los textos hardcodeados:

**Antes:**
```tsx
<Link href="/" className="text-2xl font-bold text-blue-600">
  Comunidad Viva
</Link>
```

**Después:**
```tsx
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const t = useTranslations('nav');

  return (
    <Link href="/" className="text-2xl font-bold text-blue-600">
      {t('title')}
    </Link>
  );
}
```

## Añadir el selector de idioma

Importa y usa el componente `LanguageSelector` en tu Navbar:

```tsx
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  return (
    <nav>
      {/* ... otros elementos ... */}
      <LanguageSelector />
    </nav>
  );
}
```

## Añadir nuevas traducciones

1. Abre `messages/es.json` y `messages/eu.json`
2. Añade la nueva clave siguiendo la estructura existente:

**es.json:**
```json
{
  "mySection": {
    "welcome": "Bienvenido",
    "subtitle": "Esta es mi app"
  }
}
```

**eu.json:**
```json
{
  "mySection": {
    "welcome": "Ongi etorri",
    "subtitle": "Hau nire aplikazioa da"
  }
}
```

3. Úsalo en tu componente:
```tsx
const t = useTranslations('mySection');
return <h1>{t('welcome')}</h1>;
```

## Añadir más idiomas

1. Crea un nuevo archivo en `messages/` (ej: `messages/fr.json`)
2. Actualiza `i18n.ts`:
```ts
export const locales = ['es', 'eu', 'fr'] as const;
```
3. Actualiza `next.config.js`:
```js
i18n: {
  locales: ['es', 'eu', 'fr'],
  defaultLocale: 'es',
}
```
4. Actualiza `LanguageSelector.tsx` para incluir el nuevo idioma

## Cambiar el idioma por defecto

Edita `i18n.ts`:
```ts
export const defaultLocale: Locale = 'eu'; // Cambia a euskera
```

Y `next.config.js`:
```js
i18n: {
  locales: ['es', 'eu'],
  defaultLocale: 'eu',
}
```

## Rutas con idiomas

El sistema detecta automáticamente el idioma preferido del navegador. También puedes acceder directamente:

- `/` → idioma por defecto (español)
- `/eu` → euskera
- `/eu/offers` → ofertas en euskera
- `/es/offers` → ofertas en español

## Funciones del middleware

El middleware (`src/middleware.ts`) se encarga de:
- Detectar el idioma del navegador automáticamente
- Redirigir a la versión correcta del idioma
- Mantener el idioma seleccionado en la navegación

## Mensajes con variables

Puedes usar variables en tus traducciones:

**es.json:**
```json
{
  "welcome": "Hola {name}, tienes {count} mensajes"
}
```

**En tu componente:**
```tsx
const t = useTranslations();
return <p>{t('welcome', { name: 'Juan', count: 5 })}</p>;
```

## Notas importantes

- Los cambios en los archivos de traducción requieren reiniciar el servidor de desarrollo
- El selector de idioma guarda la preferencia automáticamente
- Las traducciones se cargan de forma optimizada (solo el idioma activo)
- Compatible con SSR y SSG de Next.js

## Ejemplo de componente traducido

Ver `src/components/Navbar.tsx` para un ejemplo completo de componente traducido con el selector de idioma integrado.
