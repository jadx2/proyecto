// Envío simulado: la validación la hace el navegador con los `required` del
// HTML; aquí solo evitamos la recarga y mostramos el aviso de éxito.
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
