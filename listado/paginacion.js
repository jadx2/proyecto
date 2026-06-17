// Paginación de listados estáticos: las cards ya están en el HTML; este script
// solo muestra las 8 de la página pedida (?page=N) y dibuja los controles.
// Sin JS, se ven todas las cards (degradación correcta).
const PER_PAGE = 8;

const grid = document.querySelector("[data-grid]");
const cards = Array.from(grid.querySelectorAll(".film-card"));
const total = cards.length;
const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

const requested = Number(new URLSearchParams(location.search).get("page")) || 1;
const page = Math.min(Math.max(requested, 1), totalPages);

const startIndex = (page - 1) * PER_PAGE;
const endIndex = startIndex + PER_PAGE;
cards.forEach((card, i) => {
  card.hidden = i < startIndex || i >= endIndex;
});

const from = total === 0 ? 0 : startIndex + 1;
const to = Math.min(endIndex, total);
document.querySelector("[data-rango]").textContent =
  `Mostrando ${from}–${to} de ${total}`;
document.querySelector("[data-pagina]").textContent =
  `Página ${page} / ${totalPages}`;

// Controles: enlazan al mismo archivo con ?page=N (recarga y re-pagina).
const file = location.pathname.split("/").pop();
const pageHref = (n) => `${file}?page=${n}`;

const itemHTML = (label, target, { disabled, active } = {}) => {
  const classes = ["paginacion__item"];
  if (disabled) classes.push("paginacion__item--deshabilitado");
  if (active) classes.push("paginacion__item--activo");

  const attrs = disabled
    ? 'href="#" aria-disabled="true"'
    : active
      ? `href="${pageHref(target)}" aria-current="page"`
      : `href="${pageHref(target)}"`;

  return `
    <li class="${classes.join(" ")}">
      <a class="paginacion__link" ${attrs}>${label}</a>
    </li>
  `;
};

// Con una sola página no hay nada que paginar: se omiten los controles.
if (totalPages > 1) {
  const numbers = Array.from({ length: totalPages }, (_, i) =>
    itemHTML(i + 1, i + 1, { active: i + 1 === page }),
  ).join("");

  document.querySelector("[data-paginacion]").innerHTML = `
    <ul class="paginacion__lista">
      ${itemHTML("Ant.", page - 1, { disabled: page === 1 })}
      ${numbers}
      ${itemHTML("Sig.", page + 1, { disabled: page === totalPages })}
    </ul>
  `;
}
