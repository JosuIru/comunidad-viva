# 📊 Instrucciones para Convertir la Presentación

Este documento explica cómo convertir `PRESENTATION.md` a formatos PowerPoint (.pptx) y PDF.

---

## 🎯 Opción 1: Usando Pandoc (Recomendado)

### Instalación de Pandoc

**Ubuntu/Debian:**
```bash
sudo apt-get install pandoc
```

**macOS:**
```bash
brew install pandoc
```

**Windows:**
Descargar desde: https://pandoc.org/installing.html

### Convertir a PowerPoint (.pptx)

```bash
cd /home/josu/comunidad-viva
pandoc PRESENTATION.md -o PRESENTATION.pptx
```

### Convertir a PowerPoint con Plantilla Personalizada

```bash
pandoc PRESENTATION.md -o PRESENTATION.pptx --reference-doc=plantilla.pptx
```

### Convertir a PDF (vía LaTeX beamer)

```bash
# Requiere LaTeX instalado
pandoc PRESENTATION.md -t beamer -o PRESENTATION.pdf
```

### Convertir a PDF (vía HTML)

```bash
# Más simple, no requiere LaTeX
pandoc PRESENTATION.md -o PRESENTATION.pdf
```

---

## 🎯 Opción 2: Usando Marp (Markdown Presentation)

### Instalación

```bash
npm install -g @marp-team/marp-cli
```

### Convertir a PowerPoint

```bash
marp PRESENTATION.md -o PRESENTATION.pptx
```

### Convertir a PDF

```bash
marp PRESENTATION.md -o PRESENTATION.pdf
```

### Con Tema Personalizado

```bash
marp --theme custom.css PRESENTATION.md -o PRESENTATION.pptx
```

---

## 🎯 Opción 3: Herramientas Online (Sin Instalación)

### CloudConvert
1. Ir a: https://cloudconvert.com/md-to-pptx
2. Subir `PRESENTATION.md`
3. Seleccionar formato de salida (PPTX o PDF)
4. Descargar el resultado

### Slides.com
1. Ir a: https://slides.com
2. Importar markdown
3. Personalizar diseño
4. Exportar a PDF o PPTX (requiere cuenta)

### Google Slides
1. Copiar contenido de cada sección
2. Crear diapositivas manualmente
3. Exportar como PDF o PPTX

---

## 🎨 Personalización del Diseño

### Con Pandoc - Crear Plantilla de Referencia

1. Generar plantilla base:
```bash
pandoc -o reference.pptx --print-default-data-file reference.pptx > reference.pptx
```

2. Editar `reference.pptx` en PowerPoint:
   - Cambiar colores corporativos
   - Ajustar fuentes
   - Modificar diseño de diapositivas

3. Usar plantilla personalizada:
```bash
pandoc PRESENTATION.md -o FINAL.pptx --reference-doc=reference.pptx
```

### Con Marp - Crear Tema CSS

Crear archivo `theme.css`:

```css
/* @theme comunidad-viva */

section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Inter', sans-serif;
}

h1 {
  color: #FFD700;
  font-size: 3em;
  text-align: center;
}

h2 {
  color: #FFA500;
  border-bottom: 3px solid #FFA500;
}

code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

table {
  margin: 0 auto;
  border-collapse: collapse;
}

table th {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
}

table td {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

blockquote {
  border-left: 5px solid #FFD700;
  padding-left: 20px;
  font-style: italic;
  font-size: 1.2em;
}
```

Usar tema:
```bash
marp --theme theme.css PRESENTATION.md -o PRESENTATION.pdf
```

---

## 🎯 Opción 4: Reveal.js (Presentación HTML Interactiva)

### Instalación

```bash
npm install -g reveal-md
```

### Generar Presentación HTML

```bash
reveal-md PRESENTATION.md
```

### Exportar a PDF desde HTML

```bash
reveal-md PRESENTATION.md --print PRESENTATION.pdf
```

### Con Servidor Local (Preview)

```bash
reveal-md PRESENTATION.md -w
# Abre en http://localhost:1948
```

---

## 📐 Estructura de Diapositivas

El archivo `PRESENTATION.md` está estructurado con:

- **Separadores de diapositivas**: `---` (tres guiones)
- **Metadata YAML**: Al inicio (título, autor, fecha)
- **Secciones**: Cada `---` crea una nueva diapositiva
- **Listas**: Con `-` o `*`
- **Tablas**: Formato markdown estándar
- **Código**: Con triple backtick ```
- **Énfasis**: `**negrita**`, `*cursiva*`

---

## 🎨 Recomendaciones de Diseño

### Colores Sugeridos (Comunidad Viva)

```
- Principal: #667eea (morado)
- Secundario: #764ba2 (morado oscuro)
- Acento: #FFD700 (dorado)
- Éxito: #10b981 (verde)
- Advertencia: #f59e0b (naranja)
```

### Fuentes Recomendadas

- **Títulos**: Inter Bold, Montserrat Bold
- **Cuerpo**: Inter Regular, Open Sans
- **Código**: Fira Code, JetBrains Mono

### Imágenes

Para añadir imágenes a las diapositivas:

```markdown
![Descripción](ruta/a/imagen.png)
```

O con tamaño:

```markdown
![Descripción](ruta/a/imagen.png){ width=50% }
```

---

## 🚀 Workflow Recomendado

### Para Presentación Profesional

1. **Convertir a PowerPoint**:
```bash
pandoc PRESENTATION.md -o DRAFT.pptx
```

2. **Editar en PowerPoint**:
   - Ajustar diseño
   - Añadir imágenes
   - Personalizar colores
   - Añadir transiciones

3. **Exportar a PDF desde PowerPoint**:
   - Archivo > Exportar > Crear PDF/XPS

### Para Presentación Web Interactiva

1. **Usar Reveal.js**:
```bash
reveal-md PRESENTATION.md -w
```

2. **Personalizar con CSS**

3. **Exportar a PDF**:
```bash
reveal-md PRESENTATION.md --print PRESENTATION.pdf
```

---

## 📦 Script Automatizado de Conversión

Crear archivo `convert-presentation.sh`:

```bash
#!/bin/bash

echo "🎯 Convirtiendo presentación a múltiples formatos..."

# PowerPoint
echo "📊 Generando PowerPoint..."
pandoc PRESENTATION.md -o PRESENTATION.pptx

# PDF (vía HTML)
echo "📄 Generando PDF..."
pandoc PRESENTATION.md -o PRESENTATION.pdf

# HTML (Reveal.js)
echo "🌐 Generando HTML..."
reveal-md PRESENTATION.md --static docs

echo "✅ Conversión completada!"
echo "Archivos generados:"
echo "  - PRESENTATION.pptx"
echo "  - PRESENTATION.pdf"
echo "  - docs/index.html"
```

Dar permisos y ejecutar:
```bash
chmod +x convert-presentation.sh
./convert-presentation.sh
```

---

## 🔧 Troubleshooting

### Error: "pandoc: command not found"
**Solución**: Instalar pandoc según tu sistema operativo (ver arriba)

### Error: "pdflatex not found"
**Solución**:
```bash
# Ubuntu/Debian
sudo apt-get install texlive-latex-base texlive-fonts-recommended

# macOS
brew install --cask mactex
```

### Las tablas no se ven bien en PowerPoint
**Solución**: Usar plantilla de referencia con estilos de tabla predefinidos

### Los emojis no se muestran
**Solución**: Asegurarse de que la fuente del sistema soporte emojis, o usar Marp que tiene mejor soporte

---

## 📚 Recursos Adicionales

- **Pandoc Manual**: https://pandoc.org/MANUAL.html
- **Marp Documentation**: https://marpit.marp.app/
- **Reveal.js**: https://revealjs.com/
- **Markdown Guide**: https://www.markdownguide.org/

---

## 💡 Ejemplo de Comando Completo

### Generar PowerPoint con Tema Oscuro

```bash
pandoc PRESENTATION.md \
  -o PRESENTATION.pptx \
  --slide-level=2 \
  -V theme=Madrid \
  -V colortheme=dolphin
```

### Generar PDF Beamer con Logo

```bash
pandoc PRESENTATION.md \
  -t beamer \
  -o PRESENTATION.pdf \
  -V theme=metropolis \
  -V logo=logo.png
```

---

## 🎯 Resultado Final

Después de seguir estas instrucciones, tendrás:

✅ **PRESENTATION.pptx** - Para editar y presentar en PowerPoint
✅ **PRESENTATION.pdf** - Para distribución y visualización universal
✅ **index.html** - Para presentación web interactiva (opcional)

---

¡Buena suerte con tu presentación de Comunidad Viva! 🚀
