const NAV_LINKS = [
  { label: "Inicio", href: "../inicio/inicio.html" },
  { label: "Series", href: "../listado/listado.html?cat=series" },
  { label: "Películas", href: "../listado/listado.html?cat=peliculas" },
  { label: "Documentales", href: "../listado/listado.html?cat=documentales" },
  { label: "Contacto", href: "../contacto/contacto.html" },
];

const activeHref = () => {
  const folder = location.pathname.split("/").slice(-2, -1)[0];

  if (folder === "inicio") return "../inicio/inicio.html";
  if (folder === "contacto") return "../contacto/contacto.html";
  if (folder === "listado") {
    const cat = new URLSearchParams(location.search).get("cat") || "peliculas";
    return `../listado/listado.html?cat=${cat}`;
  }
  return "";
};

const navHTML = () => {
  const active = activeHref();
  const items = NAV_LINKS.map((link) => {
    const current = link.href === active ? ' aria-current="page"' : "";
    return `<li><a href="${link.href}"${current}>${link.label}</a></li>`;
  }).join("");

  return `
    <div>
      <a href="../inicio/inicio.html">
        <span>Lumen</span>
        <span>La Biblioteca Audiovisual</span>
      </a>

      <button type="button" aria-expanded="false" aria-label="Toggle navigation">
        <span></span>
      </button>

      <div class="nav-menu">
        <ul>${items}</ul>
      </div>
    </div>
  `;
};

const setActiveNav = (key) => {
  const menu = document.querySelector(".nav-menu");
  if (!menu) return;

  const targetHref = `../listado/listado.html?cat=${key}`;
  menu.querySelectorAll("a[aria-current]").forEach((link) => {
    link.removeAttribute("aria-current");
  });
  const target = menu.querySelector(`a[href="${targetHref}"]`);
  if (target) target.setAttribute("aria-current", "page");
};

const footerHTML = () => `
  <div>
    <div>
      <p>Lumen</p>
      <p>Una muestra curada.</p>
    </div>
  </div>
`;

const wireHamburger = (nav) => {
  const button = nav.querySelector("button");
  const menu = nav.querySelector(".nav-menu");

  button.addEventListener("click", () => {
    const open = menu.classList.toggle("nav-menu--open");
    button.setAttribute("aria-expanded", String(open));
  });
};

const main = document.querySelector("main");

const nav = document.createElement("nav");
nav.innerHTML = navHTML();
main.before(nav);

const footer = document.createElement("footer");
footer.innerHTML = footerHTML();
main.after(footer);

wireHamburger(nav);
