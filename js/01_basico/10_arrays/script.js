// Crear arrays
let numeros = [1, 2, 3, 4, 5];
let frutas = ['manzana', 'banana']; // forma recomendada (evitar new Array(...))
let mixto = [1, 'texto', true, null];

// Acceder a elementos
console.log(numeros[0]);    // 1
console.log(numeros[2]);    // 3
console.log(numeros.length); // 5

// Agregar y eliminar elementos
let colores = ['rojo', 'verde'];
colores.push('azul');      // ['rojo', 'verde', 'azul']
colores.unshift('amarillo'); // ['amarillo', 'rojo', 'verde', 'azul']
colores.pop();             // elimina 'azul'
colores.shift();           // elimina 'amarillo'

// Buscar elementos
let fruits = ['manzana', 'banana', 'naranja'];
console.log(fruits.indexOf('banana')); // 1
console.log(fruits.includes('uva'));   // false

// Unir elementos
let nums = [1, 2, 3];
console.log(nums.join('-')); // "1-2-3"
console.log(nums.join(', ')); // "1, 2, 3"
