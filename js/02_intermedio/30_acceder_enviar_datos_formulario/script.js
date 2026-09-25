const formulario = document.querySelector("#formulario-registro");

// --- Usar FormData ---
formulario.addEventListener("submit", function (event) {
  event.preventDefault(); // evita que la página se recargue

  // --- Acceder a campos directamente ---
  // Se hace dentro del submit: antes de enviar, los .value
  // estarían vacíos (el usuario todavía no escribió nada)
  const nombreDirecto = formulario.elements["nombre"].value;
  const emailDirecto = formulario.elements["email"].value;
  console.log(nombreDirecto, emailDirecto);

  const formData = new FormData(formulario);

  // Leer valores individuales
  const nombre = formData.get("nombre");
  const email = formData.get("email");
  const edad = formData.get("edad");

  console.log("Nombre:", nombre);
  console.log("Email:", email);
  console.log("Edad:", edad);

  // Leer todos los valores de un campo (ej: checkboxes)
  const intereses = formData.getAll("intereses");
  console.log("Intereses:", intereses);

  // Verificar si un campo existe
  if (formData.has("telefono")) {
    console.log("Teléfono:", formData.get("telefono"));
  }

  // Iterar todos los campos
  for (const [clave, valor] of formData.entries()) {
    console.log(`${clave}: ${valor}`);
  }

  // --- Enviar datos con fetch ---
  fetch("https://jsonplaceholder.typicode.com/users", {
    method: "POST",
    body: formData
  })
    .then(respuesta => respuesta.json())
    .then(datos => {
      console.log("Registro exitoso:", datos);
    })
    .catch(error => {
      console.error("Error:", error);
    });
});
