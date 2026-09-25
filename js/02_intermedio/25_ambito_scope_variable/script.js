// --- Ámbito global ---
var globalVar = "Soy global";
let globalLet = "Soy global también";

// En un <script> clásico, var se adhiere al objeto global
// (window) y let/const no. En un módulo (type="module")
// ninguna variable se adhiere a window: ver Pregunta 41
console.log(window.globalVar); // "Soy global" (script clásico)
console.log(window.globalLet); // undefined

function ejemplo() {
  // --- Ámbito de función ---
  var funcionVar = "Soy de función";
  let funcionLet = "Soy de función también";

  console.log(globalVar);  // accesible
  console.log(funcionVar); // accesible

  if (true) {
    // --- Ámbito de bloque ---
    var dentroDeBloqueVar = "var ignora el bloque";
    let dentroDeBloqueLet = "let respeta el bloque";
    const dentroDeBloqueConst = "const también";

    console.log(dentroDeBloqueVar);   // accesible
    console.log(dentroDeBloqueLet);   // accesible
    console.log(dentroDeBloqueConst); // accesible
  }

  console.log(dentroDeBloqueVar);   // accesible (var no respeta el bloque)
  console.log(dentroDeBloqueLet);   // ReferenceError: no existe aquí
  console.log(dentroDeBloqueConst); // ReferenceError: no existe aquí
}

// --- Temporal Dead Zone ---
{
  // TDZ: no se puede acceder a miVariable aquí
  // console.log(miVariable); // ReferenceError

  let miVariable = "Hola";
  console.log(miVariable); // "Hola" — aquí ya se puede acceder
}

// console.log(miVariable); // ReferenceError: no existe fuera del bloque
