# 50 preguntas sobre… — Códigos de ejemplo

Códigos de ejemplo de la serie de libros **50 preguntas sobre…** de **Hugo A. Segura (HyM Soft)**.

Cada libro explica cada concepto con 50 preguntas y respuestas claras. Este repositorio contiene los ejemplos en código para probar, ver y modificar.

## Aclaración importante

Los códigos de este repositorio **mantienen la esencia de los ejemplos del libro, pero tienen más "estilo"**.

En el libro los ejemplos son mínimos y didácticos a propósito (HTML puro, CSS estándar, sin adornos). Aquí el mismo concepto se presenta más vestido: mejor estructura visual, clases, variantes y casos un poco más completos, para que el lector **vea el concepto aplicado de verdad** y no solo en teoría.

La idea no cambia. Lo que cambia es la presentación.

## Contenido

* `html/` — 50 ejemplos del libro *50 preguntas sobre HTML* (estructura, texto, enlaces, imágenes, tablas, formularios, semántica, accesibilidad, metadatos, elementos modernos).
* `css/` — 50 ejemplos del libro *50 preguntas sobre CSS* (selectores, box model, Flexbox, Grid, responsivo, transiciones, animaciones, funciones, buenas prácticas).
* `js/` — 50 ejemplos del libro *50 preguntas sobre JavaScript* (misma estructura por niveles y por pregunta).

Cada tecnología se organiza en tres niveles:

* `01_basico/`
* `02_intermedio/`
* `03_avanzado/`

Cada pregunta vive en su propia carpeta con `index.html` (y `style.css` - `script.js` cuando aplica).

## Correspondencia con el libro

Cada carpeta corresponde a una pregunta numerada del libro (1–50). El número y el tema coinciden, solo que aquí el ejemplo está ampliado con más estilo para visualizar mejor el concepto.

## Portal interactivo

La raíz del repositorio contiene un portal web (`index.html`, `style.css`, `script.js`, `favicon.svg`) para recorrer los ejemplos sin abrir archivos uno por uno. Miralo en funcionamiento aquí: <https://playground-50-preguntas-sobre.vercel.app/>

* **Libros** — pestañas HTML, CSS y JavaScript, cada uno con su color.
* **Niveles** — menú acordeón Básico / Intermedio / Avanzado con buscador.
* **Editor** — código con resaltado (Monaco), ajuste de línea conmutable y pestañas por archivo (`index.html`, `style.css`, `script.js`).
* **Vista previa** — el ejemplo corriendo en vivo al lado del código, con ejecución automática o manual (`Ctrl+Enter`), botón Reset y apertura en pestaña nueva. Tus cambios se guardan en el navegador.
* **Tema claro/oscuro** — sigue al sistema, conmutable desde el header; el preview muestra cada ejemplo tal cual fue creado.
* **Sin build** — HTML + CSS + JS puros. Los ejemplos se cargan por URL relativa (`./html/...`), así funciona igual en local y en producción.

> **Nota sobre dispositivos móviles**
>
> El playground está pensado para ordenadores de escritorio. En pantallas pequeñas el editor de código y la vista previa no funcionan correctamente, por lo que el acceso desde móviles está restringido. Te recomendamos abrir el sitio desde una computadora para editar, ejecutar y ver los ejemplos en vivo.

### Probar en local

Serví la carpeta con cualquier servidor estático (no vale doble click al archivo, el `fetch` lo bloquea el navegador):

```bash
npx serve
# o
python -m http.server
```

### Deploy

Publicado tal cual en Vercel (sin configuración especial). El link "Ver en GitHub" de cada ejemplo apunta al archivo en este repositorio.
