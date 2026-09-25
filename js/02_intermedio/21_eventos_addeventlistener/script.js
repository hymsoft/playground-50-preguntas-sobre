// --- Listener básico ---
const boton = document.querySelector("#mi-boton");

function handleClick(event) {
  console.log("Clic en el botón");
  console.log("Elemento:", event.currentTarget); // el botón
}

boton.addEventListener("click", handleClick);

// --- Usar opciones ---
// once: el manejador se ejecuta una sola vez y se
// autoelimina. Atención: este listener está sobre el MISMO
// botón que el anterior, así que el primer clic dispara LOS
// DOS; recién ahí este se elimina y los clics siguientes solo
// ejecutan handleClick.
boton.addEventListener("click", function () {
  console.log("Esto se ejecuta solo una vez");
}, { once: true });

// --- Remover un listener ---
function handlerScroll() {
  console.log("Scroll detectado");
}

window.addEventListener("scroll", handlerScroll);

// Más tarde, para eliminarlo:
window.removeEventListener("scroll", handlerScroll);

// --- Usar AbortController para eliminar múltiples listeners ---
const controller = new AbortController();

window.addEventListener("scroll", handlerScroll, { signal: controller.signal });
window.addEventListener("resize", handlerScroll, { signal: controller.signal });

// Para eliminar todos los listeners asociados a este controller:
controller.abort();
