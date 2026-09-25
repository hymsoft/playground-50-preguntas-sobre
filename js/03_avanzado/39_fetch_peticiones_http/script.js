// archivo: script.js
// Petición GET
async function obtenerUsuarios() {
  try {
    const respuesta = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    const usuarios = await respuesta.json();
    console.log(usuarios);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Petición POST
async function crearUsuario(usuario) {
  try {
    const respuesta = await fetch("https://jsonplaceholder.typicode.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    });
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    const nuevoUsuario = await respuesta.json();
    console.log("Usuario creado:", nuevoUsuario);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Ejemplo de uso
obtenerUsuarios();
crearUsuario({ nombre: "Ana", email: "ana@ejemplo.com" });
