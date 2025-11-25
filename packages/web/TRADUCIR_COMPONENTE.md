# Cómo traducir un componente existente

Esta guía te ayudará a convertir cualquier componente a multilenguaje paso a paso.

## Paso 1: Identificar textos a traducir

Busca en tu componente todos los textos hardcodeados en español. Por ejemplo:

```tsx
<h1>Mis Ofertas</h1>
<button>Crear nueva oferta</button>
<p>No hay resultados</p>
```

## Paso 2: Añadir las traducciones a los archivos JSON

### En `messages/es.json`:
```json
{
  "offers": {
    "title": "Mis Ofertas",
    "createButton": "Crear nueva oferta",
    "noResults": "No hay resultados"
  }
}
```

### En `messages/eu.json`:
```json
{
  "offers": {
    "title": "Nire Eskaintzak",
    "createButton": "Eskaintza berria sortu",
    "noResults": "Ez da emaitzarik aurkitu"
  }
}
```

## Paso 3: Importar y usar en el componente

```tsx
import { useTranslations } from 'next-intl';

export default function MisOfertas() {
  const t = useTranslations('offers');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('createButton')}</button>
      <p>{t('noResults')}</p>
    </div>
  );
}
```

## Ejemplos de diferentes tipos de traducciones

### Textos con variables

**JSON:**
```json
{
  "greeting": "Hola {name}, tienes {count} mensajes nuevos"
}
```

**Componente:**
```tsx
const t = useTranslations();
<p>{t('greeting', { name: userName, count: messageCount })}</p>
```

### Traducciones con HTML o formato

**JSON:**
```json
{
  "terms": "Acepto los <link>términos y condiciones</link>"
}
```

**Componente:**
```tsx
const t = useTranslations();
<p>{t.rich('terms', {
  link: (chunks) => <a href="/terms">{chunks}</a>
})}</p>
```

### Plurales

**JSON:**
```json
{
  "items": "{count, plural, =0 {no items} =1 {one item} other {# items}}"
}
```

**Componente:**
```tsx
const t = useTranslations();
<p>{t('items', { count: itemCount })}</p>
```

## Checklist de migración

- [ ] Identificar todos los textos hardcodeados
- [ ] Añadir traducciones en `messages/es.json`
- [ ] Añadir traducciones en `messages/eu.json`
- [ ] Importar `useTranslations` en el componente
- [ ] Reemplazar textos hardcodeados con llamadas a `t()`
- [ ] Probar en ambos idiomas
- [ ] Verificar que no quedan textos sin traducir

## Componentes ya traducidos

- ✅ Navbar (ver `Navbar.i18n-example.tsx`)
- ✅ LanguageSelector

## Tips

1. **Organiza tus traducciones por secciones/páginas**
   ```json
   {
     "nav": { ... },
     "offers": { ... },
     "profile": { ... }
   }
   ```

2. **Usa namespaces específicos**
   ```tsx
   const tNav = useTranslations('nav');
   const tOffers = useTranslations('offers');
   ```

3. **Reutiliza traducciones comunes**
   ```json
   {
     "common": {
       "save": "Guardar",
       "cancel": "Cancelar",
       "edit": "Editar"
     }
   }
   ```

4. **Mantén consistencia en los nombres de claves**
   - Usa camelCase: `createButton`, `noResults`
   - Sé descriptivo pero conciso
   - Agrupa por contexto

## Herramientas útiles

### Script para encontrar textos hardcodeados

```bash
# Buscar strings en componentes
grep -r "\"[A-Z]" src/components --include="*.tsx" --include="*.ts"
```

### Validar que los JSON son válidos

```bash
# Verificar sintaxis JSON
cd packages/web/messages
for file in *.json; do
  echo "Validando $file..."
  jq empty "$file" && echo "✓ OK" || echo "✗ Error en $file"
done
```

## Ejemplo completo: Migrar página de ofertas

### Antes:
```tsx
export default function OffersPage() {
  return (
    <div>
      <h1>Ofertas de la comunidad</h1>
      <button>Crear oferta</button>
      <input placeholder="Buscar ofertas..." />
    </div>
  );
}
```

### Después:

**1. Actualizar messages/es.json:**
```json
{
  "offersPage": {
    "title": "Ofertas de la comunidad",
    "createButton": "Crear oferta",
    "searchPlaceholder": "Buscar ofertas..."
  }
}
```

**2. Actualizar messages/eu.json:**
```json
{
  "offersPage": {
    "title": "Komunitatearen eskaintzak",
    "createButton": "Eskaintza sortu",
    "searchPlaceholder": "Eskaintzak bilatu..."
  }
}
```

**3. Actualizar componente:**
```tsx
import { useTranslations } from 'next-intl';

export default function OffersPage() {
  const t = useTranslations('offersPage');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('createButton')}</button>
      <input placeholder={t('searchPlaceholder')} />
    </div>
  );
}
```

¡Listo! Tu componente ahora soporta múltiples idiomas. 🎉
