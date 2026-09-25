// Obtener un elemento del DOM
const titulo = document.querySelector("h1");
const boton = document.querySelector("button#mi-boton");

// --- Modificar contenido ---

// textContent: reemplaza todo el contenido por texto plano
titulo.textContent = "Nuevo título del documento";

// innerHTML: interpreta el contenido como HTML.
// Es un reemplazo total (no una suma): si descomentás esta
// línea, pisa lo que hizo textContent en el mismo elemento.
//titulo.innerHTML = "Nuevo <em>título</em> con formato";

// --- Modificar atributos ---

// Establecer un atributo href en un enlace
const enlace = document.querySelector("a");
enlace.setAttribute("href", "https://developer.mozilla.org");
enlace.setAttribute("target", "_blank");

// Leer un atributo actual
const hrefActual = enlace.getAttribute("href");
console.log(hrefActual); // "https://developer.mozilla.org"

// Establecer atributo booleano disabled
boton.setAttribute("disabled", "disabled");

// Eliminar el mismo atributo en el mismo elemento: si
// descomentás esta línea, anula el disabled del paso anterior
// (probalo por separado, tras recargar la página)
//boton.removeAttribute("disabled");
