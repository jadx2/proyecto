// Cat key ("peliculas" | "series" | "documentales") a partir del type interno.
const catKeyForType = (type) =>
  Object.keys(Categories).find((key) => Categories[key].type === type);

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// releaseDate llega como "YYYY-MM-DD"; se parsea a mano para evitar el
// desfase de un día que introduce new Date() al interpretar la cadena en UTC.
const formatReleaseDate = (iso) => {
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS_ES[Number(month) - 1]} ${year}`;
};

// Destino del back link según la página de procedencia (document.referrer):
// desde el inicio vuelve al inicio; desde una categoría vuelve a esa categoría.
// Sin referrer útil (link directo, recarga, origen externo) cae a la categoría
// del propio título.
const backTarget = (film) => {
  const referrer = document.referrer;
  if (referrer) {
    const url = new URL(referrer);
    if (url.origin === location.origin) {
      if (url.pathname.endsWith("/inicio.html")) {
        return { href: "inicio.html", label: "Volver al inicio" };
      }
      if (url.pathname.endsWith("/listado.html")) {
        const cat = new URLSearchParams(url.search).get("cat");
        if (Categories[cat]) {
          return {
            href: `listado.html?cat=${cat}`,
            label: `Volver a ${Categories[cat].label}`,
          };
        }
      }
    }
  }

  const key = catKeyForType(film.type);
  return {
    href: `listado.html?cat=${key}`,
    label: `Volver a ${Categories[key].label}`,
  };
};

const backLinkHTML = (film) => {
  const { href, label } = backTarget(film);
  return `
    <p class="volver">
      <a href="${href}">← ${label}</a>
    </p>
  `;
};

const fichaRowHTML = (label, value) => `
  <tr>
    <th scope="row">${label}</th>
    <td>${value}</td>
  </tr>
`;

const fichaHTML = (film) => {
  const rows = [fichaRowHTML("Tipo", getFormattedType(film.type)), fichaRowHTML("Año", film.year)];
  // Las series tienen runtime 0: se omite la fila de duración.
  if (film.runtime > 0) rows.push(fichaRowHTML("Duración", `${film.runtime} min`));
  rows.push(
    fichaRowHTML("País", film.country),
    fichaRowHTML("Estreno", formatReleaseDate(film.releaseDate)),
    fichaRowHTML("Estudio", film.studio),
  );

  return `
    <table class="ficha">
      <caption>
        Ficha técnica
      </caption>
      <tbody>
        ${rows.join("")}
      </tbody>
    </table>
  `;
};

const generosHTML = (genres) => `
  <ul class="generos" aria-label="Géneros">
    ${genres.map((genre) => `<li class="generos__item">${genre}</li>`).join("")}
  </ul>
`;

const castHTML = (cast) => `
  <ul class="creditos__list">
    ${cast.map((person) => `<li>${person}</li>`).join("")}
  </ul>
`;

// Form de valoración: solo markup. El comportamiento (star picker, envío,
// persistencia) llega en M3.5 / M3.6.
const ratingFormHTML = () => `
  <form class="review-form">
    <div class="field field--rating">
      <p class="field__label" id="ratingLabel">Tu calificación</p>
      <div class="star-picker" role="radiogroup" aria-labelledby="ratingLabel">
        ${[1, 2, 3, 4, 5]
          .map(
            (value) => `
        <button
          class="star-btn"
          type="button"
          role="radio"
          aria-checked="false"
          data-value="${value}"
          aria-label="${value} ${value === 1 ? "estrella" : "estrellas"}"
        >
          ★
        </button>
        `,
          )
          .join("")}
      </div>
    </div>

    <p class="field">
      <label class="field__label" for="reviewName">Nombre (opcional)</label>
      <input
        class="field__input"
        type="text"
        id="reviewName"
        name="reviewName"
        placeholder="Anónimo"
      />
    </p>

    <p class="field field--comment">
      <label class="field__label" for="reviewComment">Comentario</label>
      <textarea
        class="field__input"
        id="reviewComment"
        name="reviewComment"
        rows="4"
        placeholder="¿Qué te pareció?"
      ></textarea>
    </p>

    <p class="review-form__actions">
      <button class="btn-enviar" type="submit">Enviar valoración</button>
    </p>
  </form>
`;

const renderDetail = (film) => `
  ${backLinkHTML(film)}

  <section class="trailer" aria-label="Tráiler">
    <figure class="trailer__frame">
      <iframe
        src="${film.trailer}"
        title="Tráiler de ${film.title}"
        allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
          web-share;
        "
        allowfullscreen
      ></iframe>
    </figure>
  </section>

  <section class="detalle" aria-label="Información del título">
    <div class="detalle__aside">
      <figure class="poster">
        <img loading="lazy" src="${film.poster}" alt="Póster de ${film.title}" />
      </figure>

      ${fichaHTML(film)}

      ${generosHTML(film.genres)}
    </div>

    <div class="detalle__main">
      <p class="eyebrow">${getFormattedType(film.type)}</p>
      <h1 class="detalle__title">${film.title}</h1>
      <p class="detalle__director">Dirigida por <em>${film.director}</em></p>

      <div class="rating-big" aria-label="Valoración promedio">
        <p class="rating-big__stars" aria-hidden="true">${stars(film.rating)}</p>
        <div class="rating-big__values">
          <strong class="rating-big__score">${film.rating} <span>/ 5</span></strong>
          <span class="rating-big__count">Valoración del catálogo</span>
        </div>
      </div>

      <section class="sinopsis">
        <h2 class="detalle__heading">Sinopsis</h2>
        <p class="sinopsis__text">${film.synopsis}</p>
      </section>

      <div class="creditos">
        <section class="creditos__col">
          <h2 class="creditos__heading">Reparto principal</h2>
          ${castHTML(film.cast)}
        </section>

        <section class="creditos__col">
          <h2 class="creditos__heading">Dirección</h2>
          <p class="creditos__direccion">${film.director}</p>
        </section>
      </div>
    </div>
  </section>

  <section class="ratings" aria-label="Valoraciones">
    <p class="eyebrow">Valoraciones</p>
    <h2 class="ratings__title">Califica este título</h2>

    ${ratingFormHTML()}

    <h2 class="reviews__title">Valoraciones de la comunidad</h2>

    <!-- Poblado en M3.5 (persistencia en localStorage). -->
    <div class="reviews"></div>
  </section>
`;

const id = Number(getParam("id"));
const film = Number.isNaN(id) ? null : Data.byId(id);

if (!film) {
  location.replace("inicio.html");
} else {
  setActiveNav(catKeyForType(film.type));
  mount(renderDetail(film));
}
