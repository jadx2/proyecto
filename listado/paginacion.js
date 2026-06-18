/*
 * paginacion.js — CONTROLADOR DE LA PAGINACIÓN DEL LISTADO
 * --------------------------------------------------------
 * QUÉ HACE: las páginas de catálogo (peliculas.html, series.html,
 * documentales.html) ya tienen TODAS las tarjetas en el HTML. Este script
 * las parte en "páginas" de 8 en 8: muestra solo las de la página actual,
 * oculta las demás, escribe el texto "Mostrando X–Y de Z" y dibuja la
 * barra de botones (Ant. · 1 2 3 · Sig.) para navegar entre páginas.
 *
 * CUÁNDO SE CARGA: el último, tras data.js → ui.js → helpers.js. Aquí no
 * usa `Data` (las tarjetas ya están escritas en el HTML), solo lee el DOM y
 * el parámetro ?page de la URL. No define globales: corre una sola vez al
 * cargar la página y termina.
 *
 * ¿QUÉ PÁGINA MOSTRAR? La indica la URL: peliculas.html?page=2. Si no hay
 * ?page, se asume la página 1.
 *
 * CONCEPTOS: `const` = constante (su nombre no se reasigna). Una "arrow
 * function" `(args) => {...}` es una forma corta de escribir funciones.
 */

// PER_PAGE: cuántas tarjetas se ven por página. Cambiar este número cambia
// el tamaño de todas las páginas a la vez.
const PER_PAGE = 8;

// .querySelector(css) busca el PRIMER elemento que cumpla un selector CSS.
// [data-grid] = el atributo data-grid; aquí es la rejilla que contiene las tarjetas.
const grid = document.querySelector("[data-grid]");
// .querySelectorAll devuelve TODOS los que cumplen, en un "NodeList" (parecido
// a una lista pero no es un arreglo de verdad). Array.from lo convierte en
// arreglo real para poder usar .forEach, .length, índices, etc.
const cards = Array.from(grid.querySelectorAll(".film-card"));
const total = cards.length; // cuántas tarjetas hay en total

// Math.ceil redondea hacia ARRIBA: 9 tarjetas / 8 = 1.125 → 2 páginas.
// Math.max(1, ...) asegura que SIEMPRE haya al menos 1 página (aunque total sea 0).
const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

// location.search es la parte "?page=2" de la URL. URLSearchParams la analiza
// y .get("page") devuelve ese valor como texto ("2") o null si no está.
// Number(...) lo pasa a número. `|| 1`: si es null, 0 o NaN (no es número),
// usa 1 por defecto.
const requested = Number(new URLSearchParams(location.search).get("page")) || 1;
// "Acotar" la página pedida al rango válido [1, totalPages]: si pidieron 99
// pero solo hay 3 páginas, Math.min la baja a 3; Math.max evita números < 1.
const page = Math.min(Math.max(requested, 1), totalPages);

// Calcular qué tarjetas (por su posición) pertenecen a esta página.
// Página 1 → índices 0..7; página 2 → 8..15; etc. (recuerda: los índices
// empiezan en 0). startIndex es la primera; endIndex es la primera de la
// SIGUIENTE página (no se incluye).
const startIndex = (page - 1) * PER_PAGE;
const endIndex = startIndex + PER_PAGE;
// Recorre todas las tarjetas con su índice `i` y decide cuáles ocultar.
// .hidden = true esconde el elemento; una tarjeta se oculta si queda ANTES
// del inicio o DESPUÉS del fin del rango de esta página.
cards.forEach((card, i) => {
  card.hidden = i < startIndex || i >= endIndex;
});

// Texto "Mostrando X–Y de Z":
// `from` = primera tarjeta visible en humano (empieza en 1, no en 0); si no
// hay tarjetas, 0. El operador ternario es: condición ? siVerdadero : siFalso.
const from = total === 0 ? 0 : startIndex + 1;
// `to` = última visible; Math.min evita pasarse del total en la última página.
const to = Math.min(endIndex, total);
// .textContent escribe TEXTO plano (no interpreta etiquetas HTML) en el hueco
// [data-rango]. Los backticks `...${}` (template literal) insertan valores.
document.querySelector("[data-rango]").textContent =
  `Mostrando ${from}–${to} de ${total}`;
document.querySelector("[data-pagina]").textContent =
  `Página ${page} / ${totalPages}`;

// El nombre del archivo actual, para que los enlaces apunten a la misma página.
// location.pathname es la ruta (".../listado/peliculas.html"); .split("/")
// la parte por "/" y .pop() toma el último trozo → "peliculas.html".
const file = location.pathname.split("/").pop();
// pageHref(n): arma el enlace a la página n, p.ej. "peliculas.html?page=3".
const pageHref = (n) => `${file}?page=${n}`;

// itemHTML(label, target, opciones): devuelve el HTML de UN botón de la barra
// de paginación. `label` es lo que se ve ("Ant.", "1", "Sig."), `target` la
// página a la que lleva. La "desestructuración" { disabled, active } = {}
// saca esas dos opciones del objeto; el `= {}` evita error si no se pasa nada.
const itemHTML = (label, target, { disabled, active } = {}) => {
  // Lista de clases CSS del <li>; partimos de la base y añadimos según estado.
  const classes = ["paginacion__item"];
  if (disabled) classes.push("paginacion__item--deshabilitado"); // botón apagado (no se puede pulsar)
  if (active) classes.push("paginacion__item--activo"); // la página en la que estamos

  // Atributos del enlace <a>, según el estado:
  // - deshabilitado: href="#" y aria-disabled (accesibilidad: "no usable").
  // - activo: lleva a su página y aria-current="page" ("estás aquí").
  // - normal: solo el enlace a su página.
  // Es un ternario anidado: si disabled... si no, si active... si no, normal.
  const attrs = disabled
    ? 'href="#" aria-disabled="true"'
    : active
      ? `href="${pageHref(target)}" aria-current="page"`
      : `href="${pageHref(target)}"`;

  // .join(" ") une el arreglo de clases en un solo texto separado por espacios.
  return `
    <li class="${classes.join(" ")}">
      <a class="paginacion__link" ${attrs}>${label}</a>
    </li>
  `;
};

// Solo dibujar la barra si hay MÁS de una página (con una sola no hace falta).
if (totalPages > 1) {
  // Crear un botón numérico por cada página. Array.from({ length: n }, fn)
  // genera un arreglo de `n` elementos; en cada uno, `i` es el índice (0,1,2...)
  // y `_` significa "no uso el primer argumento". Marcamos como activo el
  // botón cuyo número (i+1) coincide con la página actual. .join("") une todo
  // el HTML en un solo texto (sin comas).
  const numbers = Array.from({ length: totalPages }, (_, i) =>
    itemHTML(i + 1, i + 1, { active: i + 1 === page }),
  ).join("");

  // .innerHTML = "..." REEMPLAZA el contenido del hueco [data-paginacion] por
  // la barra completa: botón "Ant." + los números + botón "Sig.".
  // "Ant." se deshabilita en la página 1; "Sig." en la última.
  document.querySelector("[data-paginacion]").innerHTML = `
    <ul class="paginacion__lista">
      ${itemHTML("Ant.", page - 1, { disabled: page === 1 })}
      ${numbers}
      ${itemHTML("Sig.", page + 1, { disabled: page === totalPages })}
    </ul>
  `;
}
