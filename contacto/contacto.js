const form = document.getElementById("contacto-form");
const alerta = form.querySelector("[data-alerta]");
const cerrarAlerta = form.querySelector("[data-cerrar-alerta]");

const FIELD_IDS = ["nombre", "correo", "asunto", "mensaje", "consent"];

const setFieldError = (id, hasError) => {
  const errorNode = form.querySelector(`[data-error="${id}"]`);
  errorNode.hidden = !hasError;
  errorNode.closest(".field").classList.toggle("field--error", hasError);
};

const isFieldValid = (id) => document.getElementById(id).checkValidity();

FIELD_IDS.forEach((id) => {
  const input = document.getElementById(id);
  const eventName =
    input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
  input.addEventListener(eventName, () => {
    if (isFieldValid(id)) setFieldError(id, false);
  });
});

cerrarAlerta.addEventListener("click", () => {
  alerta.hidden = true;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const invalidIds = FIELD_IDS.filter((id) => !isFieldValid(id));
  FIELD_IDS.forEach((id) => setFieldError(id, invalidIds.includes(id)));

  if (invalidIds.length > 0) {
    alerta.hidden = true;
    return;
  }

  form.reset();
  alerta.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
