/*
 * contacto.js — CONTROLADOR DEL FORMULARIO DE CONTACTO
 * ----------------------------------------------------
 * QUÉ HACE: maneja el envío del formulario de contacto.html. Cuando el
 * usuario pulsa "Enviar": comprueba que los campos sean válidos; si lo son,
 * muestra un mensaje de éxito y limpia el formulario. NO envía nada a ningún
 * servidor (este sitio no tiene backend): es una simulación para la demo.
 *
 * CUÁNDO SE CARGA: el último, tras data.js → ui.js → helpers.js. Aquí no usa
 * ninguno de esos globales; solo trabaja con el formulario del DOM.
 *
 * CONCEPTOS: `const` = constante. document.getElementById("x") busca el
 * elemento con id="x". addEventListener escucha un evento (aquí "submit").
 */

// Referencias a los dos elementos clave del HTML: el formulario y el cartel
// de éxito (que empieza oculto con el atributo hidden).
const form = document.getElementById("contacto-form");
const exito = document.getElementById("alerta-exito");

// addEventListener("submit", fn): ejecuta `fn` cada vez que se intenta enviar
// el formulario. El parámetro `event` representa ese envío.
form.addEventListener("submit", (event) => {
  // .preventDefault() cancela el comportamiento por defecto (recargar/navegar);
  // así controlamos el envío nosotros con JavaScript.
  event.preventDefault();

  // .checkValidity() usa la validación NATIVA del HTML (required, type="email",
  // etc.) y devuelve true si TODO está correcto. Si NO lo está:
  if (!form.checkValidity()) {
    // .reportValidity() muestra los mensajes de error nativos del navegador
    // (los globos rojos junto a cada campo) y...
    form.reportValidity();
    return; // ...detiene aquí: no mostramos éxito ni limpiamos nada.
  }

  // Si llegamos aquí, el formulario es válido:
  exito.hidden = false; // muestra el cartel de éxito (quita el atributo hidden)
  form.reset(); // vacía todos los campos del formulario
});
