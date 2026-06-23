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
