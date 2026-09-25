// Carga diferida de script
// En HTML: <script src="app.js" defer></script>

// Lazy loading de imágenes
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const imagen = entry.target;
      imagen.src = imagen.dataset.src;
      observer.unobserve(imagen);
    }
  });
});

document.querySelectorAll("img[data-src]").forEach((imagen) => {
  observer.observe(imagen);
});

// Uso de requestAnimationFrame para animaciones.
// Ejemplo mínimo: arranque único y condición de parada.
let animacionActiva = true;
let ultimoTiempo = 0;

function animar(timestamp) {
  if (!animacionActiva) return; // condición de parada
  if (timestamp - ultimoTiempo >= 16) {
    // Lógica de animación (~60 fps: actualizar transform, etc.)
    ultimoTiempo = timestamp;
  }
  requestAnimationFrame(animar);
}

requestAnimationFrame(animar); // arranque único, fuera de la función
// Para detener el bucle: animacionActiva = false;

// Cachear resultados de cálculos pesados
const cache = new Map();
function calcularDatoComplejo(parametro) {
  if (cache.has(parametro)) {
    return cache.get(parametro);
  }
  // Cálculo pesado
  let resultado = 0;
  for (let i = 0; i < 1000000; i++) {
    resultado += Math.sqrt(i * parametro);
  }
  cache.set(parametro, resultado);
  return resultado;
}
