# Resumen interactivo de Investigación Operativa (UTN.BA)

Una web **interactiva** para estudiar Investigación Operativa paso a paso: cómo **formular** cada
ejercicio, cómo **resolverlo** de principio a fin y cómo **interpretar** los resultados.

> Sin instalación: se abre con doble clic en `index.html`. No necesita servidor ni build.

## ✨ Qué incluye

- **U1 · Introducción:** conceptos, variables, funcional y restricciones.
- **U2 · Programación Lineal:** formulación (formas natural, canónica y estándar) y **método gráfico
  interactivo** que se dibuja paso a paso (cada restricción pinta su semiplano hasta formar la región factible).
- **U3 · Método Simplex:** stepper **número por número** — construye la tabla inicial conectando los
  colores con el funcional y las restricciones, y hace el pivoteo celda por celda resaltando qué se
  multiplica y qué se resta.
- **U4 · Dualidad y análisis de sensibilidad:** valores marginales, precios sombra, rangos.
- **U5 · Programación Entera** (Branch & Bound) y **U6 · Programación No Lineal**.
- **Ejercicios resueltos** (gráficos, casos del Simplex y dualidad) y la **práctica para el parcial**
  resuelta punto por punto.
- **📺 Videos** explicativos organizados por tema.

## 🧮 Piezas interactivas

- **Solucionador gráfico** (canvas): región factible, vértices, recta objetivo deslizable e interpretación
  automática. Detecta óptimo único, múltiple, no acotado y no factible.
- **Stepper del Simplex**: modo "paso a paso" (cálculo celda por celda) y modo "solo tablas".

## 🚀 Cómo usar

1. Cloná o descargá el repo.
2. Abrí `index.html` en el navegador.

Las fórmulas se renderizan con [KaTeX](https://katex.org/) por CDN (requiere conexión a internet la
primera vez para cargar la librería).

## 🛠️ Tecnología

HTML + CSS + JavaScript vanilla (sin frameworks ni build). Estructura:

```
index.html
styles.css
js/
  core.js          · registro de secciones + helpers (DOM, KaTeX)
  app.js           · navegación y routing
  widgets/         · solucionador gráfico y stepper del Simplex
  content/         · una sección por unidad + ejercicios + videos
```

## 📄 Licencia

[MIT](LICENSE) — podés usar, modificar y compartir libremente.

## 🙌 Créditos

- Videos explicativos del canal de **Ricardo Carlevari** (YouTube).
- Material de base: cátedra de Investigación Operativa, **UTN.BA** (los PDFs de la cátedra no se
  incluyen en el repo por derechos de autor).

## 👤 Autor

**ejdavenheimer**

- GitHub: https://github.com/ejdavenheimer
- LinkedIn: https://www.linkedin.com/in/ejdavenheimer/
- Discord: https://discord.gg/7S3uZXYrE7
- Plan de estudio UTN: https://planutn.dhem.tech/

📦 **Código de este proyecto:** https://github.com/ejdavenheimer/resumen-investigacion-operativa
