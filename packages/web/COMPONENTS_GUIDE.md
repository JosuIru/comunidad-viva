# 🎨 Guía de Componentes Mejorados - Truk

Esta guía explica cómo usar los nuevos componentes con animaciones y mejoras de accesibilidad.

## 📦 Componentes Disponibles

### 1. Avatar
Componente de avatar con iniciales generadas automáticamente y colores consistentes.

```tsx
import Avatar from '@/components/Avatar';

// Con iniciales generadas
<Avatar name="Juan Pérez" size="md" />

// Con imagen
<Avatar name="María García" src="/avatar.jpg" size="lg" />

// Tamaños disponibles: xs, sm, md, lg, xl
```

**Características:**
- ✨ Genera iniciales automáticamente
- 🎨 Color consistente basado en el nombre
- 🎭 Animación hover/tap
- 📱 Responsive y accesible

---

### 2. SkeletonLoader
Loaders elegantes para estados de carga.

```tsx
import SkeletonLoader from '@/components/SkeletonLoader';

// Card skeleton
<SkeletonLoader type="card" count={3} />

// List skeleton
<SkeletonLoader type="list" count={5} />

// Profile skeleton
<SkeletonLoader type="profile" />

// Feed skeleton
<SkeletonLoader type="feed" count={3} />
```

**Tipos disponibles:**
- `card` - Para tarjetas de contenido
- `list` - Para listas
- `profile` - Para perfiles de usuario
- `feed` - Para feeds sociales

---

### 3. Button
Botón mejorado con animaciones y estados de carga.

```tsx
import Button from '@/components/Button';

// Variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Con estado de carga
<Button isLoading>Loading...</Button>

// Con icono
<Button icon={<HeartIcon />}>Me gusta</Button>

// Tamaños
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

**Características:**
- 🎭 Animaciones hover y tap
- ⏳ Estado de carga integrado
- 🎨 6 variantes de estilo
- ♿ Accesible con focus rings
- 📱 Responsive

---

### 4. Card & ImageCard
Tarjetas con animaciones suaves.

```tsx
import Card, { ImageCard } from '@/components/Card';

// Card básica
<Card hover clickable>
  <div className="p-6">
    <h3>Título</h3>
    <p>Contenido</p>
  </div>
</Card>

// ImageCard
<ImageCard
  title="Oferta de Bicicleta"
  description="Bicicleta en buen estado"
  imageSrc="/bike.jpg"
  footer={
    <div className="flex justify-between">
      <span>10 créditos</span>
      <button>Ver más</button>
    </div>
  }
/>
```

**Características:**
- 🎭 Animación de entrada (fade in + slide up)
- ⬆️ Efecto hover (elevación)
- 🖱️ Efecto tap para clickables
- 🎨 Footer opcional
- 📸 Soporte para imágenes y placeholders

---

### 5. ThemeToggle
Toggle mejorado para dark/light mode con animación de rotación.

```tsx
import ThemeToggle from '@/components/ThemeToggle';

<ThemeToggle />
```

**Características:**
- 🌓 Transición suave entre temas
- 🔄 Animación de rotación del icono
- ♿ ARIA labels descriptivos
- 🎭 Efectos hover y tap

---

## 🎬 Utilidades de Animación

Usa las variantes predefinidas para animar tus componentes:

```tsx
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, listItem } from '@/utils/animations';

// Fade in desde abajo
<motion.div variants={fadeInUp} initial="hidden" animate="visible">
  Contenido
</motion.div>

// Lista con stagger
<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={listItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

**Variantes disponibles:**
- `fadeIn` - Fade simple
- `fadeInUp` - Fade desde abajo
- `scaleIn` - Scale desde pequeño
- `slideInRight` - Desde la derecha
- `slideInLeft` - Desde la izquierda
- `staggerContainer` - Para listas animadas
- `listItem` - Items de lista
- `pageTransition` - Transiciones de página
- `bounce` - Efecto rebote
- `pulse` - Efecto pulso
- `shake` - Para errores

---

## 🎨 Clases de Tailwind Personalizadas

### Animaciones CSS
```tsx
// Fade in
<div className="animate-fade-in">...</div>

// Fade in up
<div className="animate-fade-in-up">...</div>

// Scale in
<div className="animate-scale-in">...</div>

// Slide in desde derecha
<div className="animate-slide-in-right">...</div>

// Bounce suave
<div className="animate-bounce-gentle">...</div>
```

### Sombras Personalizadas
```tsx
// Sombra suave
<div className="shadow-soft">...</div>

// Efecto glow azul
<div className="shadow-glow">...</div>

// Efecto glow verde
<div className="shadow-glow-green">...</div>
```

---

## ♿ Mejoras de Accesibilidad

Todos los componentes incluyen:

- ✅ **ARIA labels** descriptivos
- ✅ **Focus rings** visibles
- ✅ **Contraste WCAG AA**
- ✅ **Navegación por teclado**
- ✅ **Screen reader support**

### Ejemplo de uso accesible:

```tsx
<Button
  variant="primary"
  aria-label="Añadir a favoritos"
  onClick={handleFavorite}
>
  <HeartIcon />
</Button>
```

---

## 🎯 Toast Notifications

Las notificaciones toast han sido mejoradas con:

- ✅ Colores diferenciados por tipo (success, error, loading)
- ✅ Iconos visuales
- ✅ Sombras suaves
- ✅ Esquinas redondeadas
- ✅ Duración apropiada por tipo

```tsx
import toast from 'react-hot-toast';

// Success
toast.success('¡Operación exitosa!');

// Error
toast.error('Ha ocurrido un error');

// Loading
const toastId = toast.loading('Procesando...');
// Luego actualizar:
toast.success('¡Completado!', { id: toastId });
```

---

## 📱 Responsive Design

Todos los componentes son responsive por defecto:

```tsx
// Avatar responsive
<Avatar
  name="User"
  size="sm"  // Móvil
  className="md:w-12 md:h-12 lg:w-16 lg:h-16"  // Desktop
/>

// Button responsive
<Button
  size="sm"  // Móvil
  className="md:text-base lg:text-lg"  // Desktop
>
  Acción
</Button>
```

---

## 🚀 Mejores Prácticas

1. **Performance**: Usa `SkeletonLoader` en lugar de spinners
2. **UX**: Siempre proporciona feedback visual con animaciones
3. **Accesibilidad**: Añade ARIA labels a iconos y botones
4. **Consistencia**: Usa los componentes pre-construidos
5. **Dark Mode**: Todos los componentes soportan dark mode automáticamente

---

## 📖 Ejemplo Completo

```tsx
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, listItem } from '@/utils/animations';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import { ImageCard } from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';

function OffersPage() {
  const { data: offers, isLoading } = useQuery(['offers'], fetchOffers);

  if (isLoading) {
    return <SkeletonLoader type="card" count={6} />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {offers.map((offer) => (
        <motion.div key={offer.id} variants={listItem}>
          <ImageCard
            title={offer.title}
            description={offer.description}
            imageSrc={offer.image}
            clickable
            footer={
              <div className="flex items-center justify-between">
                <Avatar name={offer.owner.name} size="sm" />
                <Button variant="primary" size="sm">
                  Ver Oferta
                </Button>
              </div>
            }
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

¡Disfruta creando interfaces hermosas y accesibles con Truk! 🚀
