// JavaScript puede responder a eventos del usuario
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar un mensaje cuando la página se carga completamente
  console.log('¡Página cargada!');
  
  // Cambiar el estilo de la página cuando se hace clic
  document.body.addEventListener('click', function() {
    document.body.style.backgroundColor = '#3366cc';
  });
});
