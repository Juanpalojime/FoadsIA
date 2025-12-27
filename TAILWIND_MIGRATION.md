# 🎨 Migración a Tailwind CSS + Shadcn/ui + Framer Motion

## ✅ Completado

### Dependencias Instaladas

```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "tailwindcss-animate": "^1.x",
    "@radix-ui/react-slot": "^1.x"
  }
}
```

### Archivos de Configuración Creados

1. ✅ **`tailwind.config.js`** - Configuración de Tailwind con tema Shadcn/ui
2. ✅ **`postcss.config.js`** - Configuración de PostCSS
3. ✅ **`src/lib/utils.ts`** - Utilidad `cn()` para merge de clases
4. ✅ **`src/styles/global.css`** - CSS global con Tailwind directives

### Componentes UI Creados

1. ✅ **`src/components/ui/button.tsx`** - Componente Button con variantes
2. ✅ **`src/components/ui/card.tsx`** - Componente Card con sub-componentes

---

## 🎨 Sistema de Diseño

### Colores (Dark Mode)

```css
--background: 222.2 84% 4.9%;      /* Fondo principal oscuro */
--foreground: 210 40% 98%;          /* Texto principal */
--primary: 263 70% 50%;             /* Púrpura vibrante */
--secondary: 217.2 32.6% 17.5%;    /* Gris oscuro */
--muted: 217.2 32.6% 17.5%;        /* Gris apagado */
--accent: 217.2 32.6% 17.5%;       /* Acento */
--destructive: 0 62.8% 30.6%;      /* Rojo para acciones destructivas */
```

### Variantes de Button

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="glass">Glass Effect</Button>
```

### Tamaños de Button

```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

---

## 🎭 Framer Motion - Ejemplos

### Animación Básica

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Contenido animado
</motion.div>
```

### Hover Animation

```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Hover me
</motion.div>
```

### Stagger Children

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  <motion.div variants={item}>Item 1</motion.div>
  <motion.div variants={item}>Item 2</motion.div>
  <motion.div variants={item}>Item 3</motion.div>
</motion.div>
```

### Page Transitions

```tsx
import { AnimatePresence, motion } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <Routes location={location}>
      {/* Your routes */}
    </Routes>
  </motion.div>
</AnimatePresence>
```

---

## 🛠️ Utilidades de Tailwind Personalizadas

### Glassmorphism

```tsx
<div className="glass p-6 rounded-lg">
  Contenido con efecto glass
</div>
```

### Text Gradient

```tsx
<h1 className="text-gradient text-4xl font-bold">
  Texto con gradiente
</h1>
```

### Glow Effect

```tsx
<div className="glow glow-hover p-4 rounded-lg">
  Elemento con efecto glow
</div>
```

### Scrollbar Personalizado

```tsx
<div className="scrollbar-thin overflow-auto">
  Contenido con scrollbar delgado
</div>
```

---

## 📋 Guía de Migración de Componentes

### Antes (CSS Vanilla)

```tsx
// Componente antiguo
<button className="premium-button">
  Click me
</button>

// CSS
.premium-button {
  background: var(--grad-primary);
  color: white;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
```

### Después (Tailwind + Shadcn/ui)

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="default">
  Click me
</Button>
```

### Migración de Cards

#### Antes

```tsx
<div className="card">
  <div className="card-header">
    <h3>Title</h3>
    <p>Description</p>
  </div>
  <div className="card-content">
    Content
  </div>
</div>
```

#### Después

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

---

## 🎯 Próximos Pasos

### Componentes a Migrar

1. **Layout Components**
   - [ ] `Layout.tsx` - Usar Tailwind classes
   - [ ] `Sidebar.tsx` - Agregar animaciones con Framer Motion
   - [ ] `TopBar.tsx` - Usar Button component

2. **Pages**
   - [ ] `Home.tsx` - Migrar a Card components + animaciones
   - [ ] `AdCreator.tsx` - Usar form components de Shadcn/ui
   - [ ] `GenerateImages.tsx` - Agregar transiciones
   - [ ] `FaceSwap.tsx` - Animaciones de carga
   - [ ] `Settings.tsx` - Form components
   - [ ] `BrandVault.tsx` - Grid con animaciones stagger

3. **Componentes Adicionales de Shadcn/ui a Agregar**
   - [ ] Input
   - [ ] Textarea
   - [ ] Select
   - [ ] Dialog/Modal
   - [ ] Toast/Sonner
   - [ ] Progress
   - [ ] Tabs
   - [ ] Badge
   - [ ] Avatar

---

## 💡 Best Practices

### 1. Usar `cn()` para Combinar Clases

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
  Content
</div>
```

### 2. Componentes Reutilizables

```tsx
// AnimatedCard.tsx
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export function AnimatedCard({ children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  )
}
```

### 3. Variantes de Animación Reutilizables

```tsx
// animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

// Uso
<motion.div {...fadeInUp}>Content</motion.div>
```

---

## 🚀 Ejemplo Completo: Página Migrada

```tsx
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export function ExamplePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold text-gradient mb-8"
      >
        Welcome to EnfoadsIA
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="glass glow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Feature {i}
                </CardTitle>
                <CardDescription>
                  Description of feature {i}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
```

---

## 📚 Recursos

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn/ui**: https://ui.shadcn.com/
- **Framer Motion**: https://www.framer.com/motion/
- **Lucide Icons**: https://lucide.dev/

---

**Migración iniciada**: 2025-12-27  
**Estado**: ✅ Configuración base completada  
**Próximo paso**: Migrar componentes existentes
