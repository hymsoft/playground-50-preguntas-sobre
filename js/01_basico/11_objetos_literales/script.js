// Crear un objeto literal
let persona = {
  nombre: 'Carlos',
  edad: 30,
  esEstudiante: false,
  hobbies: ['leer', 'correr'],
  direccion: {
    ciudad: 'Madrid',
    pais: 'España'
  }
};

// Acceder con notación de punto
console.log(persona.nombre);      // "Carlos"
console.log(persona.edad);        // 30
console.log(persona.direccion.ciudad); // "Madrid"

// Acceder con notación de corchetes
console.log(persona['nombre']);    // "Carlos"
let propiedad = 'edad';
console.log(persona[propiedad]);  // 30

// Modificar propiedades
persona.edad = 31;
persona['email'] = 'carlos@ejemplo.com';

// Métodos (funciones como propiedades)
let calculadora = {
  sumar: function(a, b) {
    return a + b;
  },
  restar(a, b) {  // shorthand
    return a - b;
  }
};

console.log(calculadora.sumar(5, 3));  // 8
console.log(calculadora.restar(5, 3)); // 2

// Verificar si existe una propiedad
console.log('nombre' in persona); // true
console.log(Object.hasOwn(persona, 'edad')); // true (ES2022)
// Forma anterior: persona.hasOwnProperty('edad').
// Es frágil porque falla si el objeto redefine esa clave,
// por eso se prefiere Object.hasOwn()
