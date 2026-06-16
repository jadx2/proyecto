setActiveNav("inicio");

const heroSlideHTML = (film, index, total) => `
  <section
    class="hero__slide${index === 0 ? " hero__slide--active" : ""}"
    aria-roledescription="diapositiva"
    aria-label="Diapositiva ${index + 1} de ${total}"
  >
    <figure class="hero__media">
      <img loading="lazy" src="${film.poster}" alt="Póster de ${film.title}" />
    </figure>
    <h2 class="hero__title">${film.title}</h2>
    <p class="hero__meta">${filmMeta(film)}</p>
    <p class="hero__synopsis">${film.synopsis}</p>
    <p class="hero__cta">
      <a href="detalles.html?id=${film.id}">Ver detalle →</a>
    </p>
  </section>
`;

const heroDotHTML = (index) => `
  <li>
    <button
      class="hero__dot${index === 0 ? " hero__dot--active" : ""}"
      type="button"
      aria-label="Ir a la diapositiva ${index + 1}"
    >
      ${index + 1}
    </button>
  </li>
`;

const heroHTML = (films) => `
  <section class="hero" aria-label="Destacados">
    ${films.map((film, i) => heroSlideHTML(film, i, films.length)).join("")}
    <div class="hero__controls" role="group" aria-label="Controles del carrusel">
      <button class="hero__nav hero__nav--prev" type="button">Anterior</button>
      <button class="hero__nav hero__nav--next" type="button">Siguiente</button>
      <ol class="hero__dots" aria-label="Indicadores de diapositiva">
        ${films.map((_, i) => heroDotHTML(i)).join("")}
      </ol>
    </div>
  </section>
`;

const stripHTML = (config) => `
  <section class="strip" aria-label="${config.ariaLabel}">
    <header class="strip__header">
      <p class="strip__eyebrow">MEJOR VALORADOS</p>
      <h2 class="strip__title">${config.title}</h2>
      <p class="strip__viewall">
        <a href="listado.html?cat=${config.cat}">Ver todo →</a>
      </p>
    </header>
    ${Data.topRated(config.type, 4).map(cardHTML).join("")}
  </section>
`;

const STRIPS = [
  {
    type: "movie",
    title: "Películas Destacadas",
    cat: "peliculas",
    ariaLabel: "Películas",
  },
  {
    type: "series",
    title: "Series Limitadas",
    cat: "series",
    ariaLabel: "Series",
  },
  {
    type: "documentary",
    title: "Documental",
    cat: "documentales",
    ariaLabel: "Documentales",
  },
];

const renderHome = () =>
  heroHTML(Data.topRated(undefined, 5)) + STRIPS.map(stripHTML).join("");

if (typeof renderHome === "function") mount(renderHome());
