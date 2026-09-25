// --- localStorage: persistencia permanente ---
// Guardar datos
localStorage.setItem("nombre", "Carlos");
localStorage.setItem("edad", "25");

// Guardar un objeto (debe convertirse a JSON)
const usuario = { nombre: "Ana", email: "ana@ejemplo.com" };
localStorage.setItem("usuario", JSON.stringify(usuario));

// Leer datos
const nombre = localStorage.getItem("nombre");
console.log(nombre); // "Carlos"

const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
console.log(usuarioGuardado.email); // "ana@ejemplo.com"

// Verificar si existe una clave
if (localStorage.getItem("nombre")) {
  console.log("La clave 'nombre' existe");
}

// Eliminar una clave
localStorage.removeItem("edad");

// Limpiar todo
localStorage.clear();

// --- sessionStorage: solo durante la sesión ---
// Funciona igual que localStorage
sessionStorage.setItem("token", "abc123");
const token = sessionStorage.getItem("token");
console.log(token); // "abc123"

// No hace falta llamar a sessionStorage.clear(): el navegador
// descarta sessionStorage al cerrar la pestaña

// --- Diferencia: ámbito por pestaña ---
// Si se abre otra pestaña, tendrá su propio sessionStorage
// pero compartirán el mismo localStorage

// --- Uso práctico: persistir preferencias ---
function guardarPreferencias(preferencias) {
  localStorage.setItem("preferencias", JSON.stringify(preferencias));
}

function cargarPreferencias() {
  const datos = localStorage.getItem("preferencias");
  if (datos) {
    return JSON.parse(datos);
  }
  return { tema: "claro", idioma: "es" }; // valores por defecto
}

// Uso
const misPreferencias = cargarPreferencias();
console.log(misPreferencias.tema); // "claro"
