// --- this en contexto global ---
// En un <script> clásico, this es window; en un módulo
// (type="module") this es undefined en el nivel superior:
// ver Pregunta 41
console.log(this === window); // true en un script clásico
// (dentro de una función llamada sin contexto, this sería
// undefined en modo estricto)

// --- this en método de objeto ---
const persona = {
  nombre: "Ana",
  saludar() {
    console.log(`Hola, soy ${this.nombre}`);
  }
};
persona.saludar(); // "Hola, soy Ana" — this es persona

// --- this en función regular ---
function mostrarThis() {
  console.log(this);
}
mostrarThis(); // window (modo no estricto) o undefined (modo estricto)

// --- this en función flecha ---
const contador = {
  cuenta: 0,
  iniciar() {
    // La función flecha hereda this del método iniciar
    setInterval(() => {
      this.cuenta++;
      console.log(this.cuenta);
    }, 1000);
  }
};
// Si se usara function() en lugar de () =>, this sería undefined o window

// --- Usar call, apply y bind ---
function saludar(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const obj1 = { name: "Carlos" };
const obj2 = { name: "Laura" };

// call: invoca con contexto y argumentos individuales
saludar.call(obj1, "Hola", "!"); // "Hola, Carlos!"

// apply: invoca con contexto y argumentos como array
saludar.apply(obj2, ["Buenos días", "."]); // "Buenos días, Laura."

// bind: crea nueva función con this fijo
const saludarCarlos = saludar.bind(obj1);
saludarCarlos("Hey", "?"); // "Hey, Carlos?"

// --- this en constructores ---
function Persona(nombre) {
  this.nombre = nombre;
}
const juan = new Persona("Juan");
console.log(juan.nombre); // "Juan"
