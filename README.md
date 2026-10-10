# PlopGraph 📈

> **Graficador interactivo de curvas, funciones y diagramas conceptuales.**  
> Diseñado para crear gráficos de alta calidad visual para economía, ciencias, matemáticas, ingeniería y presentaciones académicas.

[![Author](https://img.shields.io/badge/Author-Verred-blue.svg)](https://github.com/Verred)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-green.svg)](https://verred.github.io/PlopGraph/)

---

## 🌟 Características Principales / Key Features

- 🌐 **Soporte Bilingüe / Bilingual Support (ES / EN):** Cambio instantáneo de idioma con persistencia en `localStorage`.
- 〰️ **Curvas Bézier Interactivas:** Crea y curva libremente líneas o trayectorias arrastrando su tirador central amarillo.
- ↗️ **Flechas Direccionables en 360°:** Arrastra el tirador para rotar la flecha en cualquier ángulo y cambiar su tamaño. Las cabezas de flecha adoptan dinámicamente el mismo color del trazo.
- 🧮 **Llaves Agrupadoras `{ }` Rotables:** Llaves sin texto predeterminado que pueden girarse en 360°, expandirse o invertirse mediante tiradores de control.
- 📍 **Puntos de Referencia y Proyecciones:** Proyecciones ortogonales punteadas o continuas hacia los ejes X e Y, con cotas numéricas o referenciales automáticas.
- 📏 **Ejes Flexibles y Cuadrícula Tenue:** Ejes con escalas uniformes, referenciales (solo puntos) o combinadas, con opción de cuadrícula tenue (*faint grid*).
- 💾 **Exportación en Alta Definición:** Exporta directamente a gráficos vectoriales **SVG** o imágenes de mapa de bits **PNG (2x Retina)**.
- ⚡ **Sin Dependencias ni Compiladores:** Funciona abriendo directamente `index.html` en el navegador (doble clic) o sirviéndolo en GitHub Pages sin necesidad de `npm install` ni `npm run`.

---

## 📁 Estructura del Proyecto / Project Structure

```text
PlopGraph/
├── index.html         # Estructura principal y maquetado de la aplicación
├── css/
│   └── styles.css     # Estilos visuales, temas, barra de herramientas y diseño adaptable
├── js/
│   ├── i18n.js        # Diccionario y soporte multilingüe (Español / Inglés)
│   ├── state.js       # Estado global reactivo y plantillas de ejemplo
│   ├── coords.js      # Transformación matemática entre coordenadas lógicas y SVG
│   ├── render.js      # Motor de renderizado para ejes, cuadrícula, curvas, flechas y llaves
│   ├── interaction.js # Controladores de eventos de ratón, drag-and-drop y dibujo
│   └── app.js         # Inicialización, inspector de propiedades, atajos y exportación
└── README.md          # Documentación general del repositorio
```

---

## 🚀 Cómo Usarlo / Quick Start

### 1. Uso Local (Sin instalación)
Simplemente haz doble clic en el archivo `index.html` en tu navegador favorito (Chrome, Edge, Firefox, Safari).  
No requiere Node.js ni ningún servidor web para funcionar al 100%.

### 2. Despliegue en GitHub Pages
Para desplegar tu proyecto gratuitamente en internet:
1. Sube este repositorio a tu cuenta de GitHub (`git push origin main`).
2. Entra a tu repositorio en GitHub y ve a **Settings** > **Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/(root)`.
4. Haz clic en **Save**. En 1 minuto tendrás tu enlace disponible (ej. `https://verred.github.io/PlopGraph/`).

---

## ⌨️ Atajos de Teclado / Keyboard Shortcuts

| Tecla | Acción |
| :--- | :--- |
| `V` | Modo Seleccionar / Mover |
| `P` | Modo Añadir Punto |
| `C` | Modo Añadir Curva |
| `T` | Modo Añadir Texto |
| `Supr` / `Backspace` | Eliminar elemento seleccionado |

---

## 👤 Creador / Author

Desarrollado y mantenido por **Verred**:
- GitHub: [@Verred](https://github.com/Verred)
- Repositorio: [https://github.com/Verred/PlopGraph](https://github.com/Verred/PlopGraph)
- Correo / Email: [portal_obregon@outlook.es](mailto:portal_obregon@outlook.es)

---

## 📄 Licencia / License

Este proyecto está bajo la Licencia MIT. Consulta el archivo de licencia para más detalles.