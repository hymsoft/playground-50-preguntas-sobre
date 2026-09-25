// --- Crear un elemento ---
const nuevoParrafo = document.createElement("p");
nuevoParrafo.textContent = "Este párrafo se creó dinámicamente.";

// --- Insertar al final del body ---
document.body.appendChild(nuevoParrafo);

// --- Insertar antes de un elemento existente ---
const referencia = document.querySelector("h1");
const otroParrafo = document.createElement("p");
otroParrafo.textContent = "Estoy antes del título.";
referencia.parentNode.insertBefore(otroParrafo, referencia);

// --- Usar append y prepend (más moderno) ---
const contenedor = document.querySelector(".lista");
const item1 = document.createElement("li");
item1.textContent = "Primer item";
contenedor.prepend(item1); // al inicio

const item2 = document.createElement("li");
item2.textContent = "Último ítem";
contenedor.append(item2); // al final

// --- Insertar usando insertAdjacentElement ---
const div = document.querySelector(".seccion");
const nuevoDiv = document.createElement("div");
nuevoDiv.textContent = "Contenido adyacente";
div.insertAdjacentElement("afterend", nuevoDiv);

// --- Eliminar elementos ---
// Elegí una de las dos opciones, no las dos seguidas:
// si ejecutás la B después de la A, el elemento ya fue
// eliminado y la B no tiene nada que borrar.

// OPCIÓN A: forma moderna
const elementoAEliminar = document.querySelector(".obsoleto");
elementoAEliminar.remove();

// OPCIÓN B (comentar la A antes de usar): eliminar desde el padre
// const elementoAEliminar = document.querySelector(".obsoleto");
// const padre = elementoAEliminar.parentNode;
// if (padre) {
//   padre.removeChild(elementoAEliminar);
// }
