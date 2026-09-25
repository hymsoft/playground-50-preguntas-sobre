// Interpolación de variables
let nombre = 'María';
let edad = 25;
let mensaje = `Hola, me llamo ${nombre} y tengo ${edad} años`;
console.log(mensaje); // "Hola, me llamo María y tengo 25 años"

// Expresiones dentro de ${}
let precio = 19.99;
let cantidad = 3;
let total = `Total: $${precio * cantidad}`;
console.log(total); // "Total: $59.97"

// Cadenas multilínea
let html = `
  <div>
    <h1>${nombre}</h1>
    <p>Edad: ${edad}</p>
  </div>
`;
console.log(html);

// Llamadas a funciones dentro de ${}
function calcularEdad(anioNacimiento) {
  return new Date().getFullYear() - anioNacimiento;
}

let anio = 1990;
let info = `Nací en ${anio} y tengo ${calcularEdad(anio)} años`;
console.log(info); // "Nací en 1990 y tengo N años" (N = año actual - 1990)

// Template literals vs concatenación
let viejo = 'Hola, ' + nombre + '. Tienes ' + edad + ' años.';
let nuevo = `Hola, ${nombre}. Tienes ${edad} años.`;
