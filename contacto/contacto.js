document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contacto-form");
  const inputNombre = document.getElementById("nombre");
  const mensajeTextArea = document.getElementById("mensaje");
  const alertaExito = document.getElementById("alerta-exito");

  if (alertaExito && form) {
    form.parentElement.insertBefore(alertaExito, form);

    if (!document.getElementById("btn-cerrar-exito")) {
      const btnCerrar = document.createElement("button");
      btnCerrar.id = "btn-cerrar-exito";
      btnCerrar.type = "button";
      btnCerrar.innerHTML = "&times;";
      btnCerrar.setAttribute("aria-label", "Cerrar alerta");

      btnCerrar.addEventListener("click", () => {
        alertaExito.setAttribute("hidden", "true");
      });

      alertaExito.appendChild(btnCerrar);
    }
  }

  form.classList.add("needs-validation");
  inputNombre.setAttribute("minlength", "3");
  mensajeTextArea.setAttribute("minlength", "10");
  mensajeTextArea.setAttribute("maxlength", "2000");

  const mensajesError = {
    nombre: "Por favor, introduce tu nombre.",
    correo: "Por favor, introduce un correo válido.",
    asunto: "Por favor, elige un asunto.",
    mensaje:
      "Por favor, escribe al menos unas palabras (mínimo 10 caracteres).",
    consent: "El consentimiento es obligatorio.",
  };

  Object.keys(mensajesError).forEach((id) => {
    const elemento = document.getElementById(id);
    if (
      elemento &&
      !elemento.parentElement.querySelector(".invalid-feedback")
    ) {
      const feedbackDiv = document.createElement("div");
      feedbackDiv.className = "invalid-feedback";
      feedbackDiv.textContent = mensajesError[id];
      elemento.parentElement.appendChild(feedbackDiv);
    }
  });

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    evento.stopPropagation();

    if (form.checkValidity()) {
      alertaExito.removeAttribute("hidden");
      form.classList.remove("was-validated");
      form.reset();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      }); 

    } else {
      form.classList.add("was-validated");
      alertaExito.setAttribute("hidden", "true");
    }
  });
});  




