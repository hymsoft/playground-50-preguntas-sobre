// ============================================================
// EJEMPLO 1: orden de la propagación
// ============================================================
// Si ya probaste el Ejemplo 2 en esta misma página, recargá
// la página antes: los listeners de antes seguirían activos
// y los registros se duplicarían.
const abuelo = document.querySelector("#abuelo");
const padre = document.querySelector("#padre");
const hijo = document.querySelector("#hijo");

// Listeners en la fase de burbuja (por defecto)
abuelo.addEventListener("click", () => console.log("Abuelo - burbuja"));
padre.addEventListener("click", () => console.log("Padre - burbuja"));
hijo.addEventListener("click", () => console.log("Hijo - burbuja"));

// Listener en la fase de captura
abuelo.addEventListener("click", () => console.log("Abuelo - captura"), true);

// Al hacer clic en #hijo, el orden será:
// Abuelo - captura
// Hijo - burbuja
// Padre - burbuja
// Abuelo - burbuja

// ============================================================
// EJEMPLO 2: detener la propagación
// ============================================================
// Para probarlo: recargá la página y comenta los listeners
// del Ejemplo 1. Si todo corre junto, el
// stopImmediatePropagation del hijo corta la cadena antes de
// que el evento llegue al padre y al abuelo, y no se ve el
// orden anunciado arriba.

// --- 2a. stopPropagation en el padre ---
// (dejar 2b comentado mientras probás este bloque)
// padre.addEventListener("click", function (event) {
//   console.log("Padre ejecutado, deteniendo la propagación...");
//   event.stopPropagation(); // el evento NO llegará a abuelo
// });

// Con 2a activo (y el Ejemplo 1 comentado), al hacer clic
// en #hijo:
//   Padre - burbuja (detiene aquí: abuelo no lo recibe)

// --- 2b. stopImmediatePropagation en el hijo ---
// (descomentá este bloque y comentá 2a)
// A diferencia de stopPropagation, también impide que se
// ejecuten los listeners restantes del MISMO elemento.
// hijo.addEventListener("click", function (event) {
//   console.log("Primer listener del hijo");
//   event.stopImmediatePropagation();
// });
// hijo.addEventListener("click", function () {
//   console.log("Segundo listener del hijo"); // NUNCA se ejecuta
// });
