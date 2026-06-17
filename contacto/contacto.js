// Envío simulado. El form tiene `novalidate`, así que la validación la dispara
// este script con la API nativa: checkValidity() comprueba los `required` del
// HTML y reportValidity() muestra los mensajes del navegador. Solo si todo es
// válido se muestra el aviso de éxito.
const form = document.getElementById("contacto-form");
const exito = document.getElementById("alerta-exito");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  exito.hidden = false;
  form.reset();
});
