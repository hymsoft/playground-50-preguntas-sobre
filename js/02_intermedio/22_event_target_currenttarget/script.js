// Ejemplo con delegación de eventos
const lista = document.querySelector("#lista-tareas");

lista.addEventListener("click", function (event) {
  // event.target: el elemento donde se hizo clic (puede ser un <li> o un <span>)
  console.log("Target:", event.target);
  console.log("Texto del target:", event.target.textContent);

  // event.currentTarget: el <ul> al que se le asignó el listener
  console.log("CurrentTarget:", event.currentTarget);
  console.log("Tag del currentTarget:", event.currentTarget.tagName);

  // this es igual a event.currentTarget
  console.log("this:", this);
  console.log("Son iguales:", this === event.currentTarget); // true

  // Usar target para manejar clics en elementos hijos.
  // Patrón frágil: ver el cierre del ejemplo y la pregunta 48
  if (event.target.tagName === "BUTTON") {
    console.log("Se hizo clic en un botón:", event.target.textContent);
  }
});

// El chequeo event.target.tagName === "BUTTON" funciona cuando
// el clic cae directamente sobre el botón, pero es frágil: si
// el clic cae en un hijo del botón (por ejemplo un <span>
// interno), target apunta a ese hijo y la condición no se
// cumple. La forma robusta es event.target.closest("button"),
// que busca el ancestro más cercano que coincida con el
// selector; la limitación de este patrón naive y su solución
// se analizan en la pregunta 48 (delegación de eventos).
