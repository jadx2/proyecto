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

// Form de valoración: markup. El comportamiento (star picker, validación,
// envío y persistencia) se cablea en wireRatingForm() tras montar.
const ratingFormHTML = () => `
  <form class="review-form" novalidate>
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
      <p class="field__error" data-error="stars" hidden>
        Selecciona una calificación.
      </p>
    </div>

    <p class="field">
      <label class="field__label" for="reviewName">Nombre</label>
      <input
        class="field__input"
        type="text"
        id="reviewName"
        name="reviewName"
        required
      />
      <span class="field__error" data-error="name" hidden>
        Ingresa tu nombre.
      </span>
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

const reviewCardHTML = (entry) => `
  <article class="review-card">
    <div class="review-card__head">
      <p class="review-card__stars" aria-hidden="true">${stars(entry.stars)}</p>
      <p class="review-card__author">${entry.name}</p>
      <p class="review-card__date">${entry.date}</p>
    </div>
    ${entry.comment ? `<p class="review-card__text">${entry.comment}</p>` : ""}
  </article>
`;

const reviewsHTML = (film) => {
  const ratings = loadRatings(film.id);
  if (ratings.length === 0) {
    return `<p class="reviews__empty">Aún no hay valoraciones. ¡Sé el primero en opinar!</p>`;
  }
  return ratings.map(reviewCardHTML).join("");
};

const ratingBigHTML = (film) => {
  const { avg, count } = avgRating(film);
  const label = count === 1 ? "valoración" : "valoraciones";
  return `
    <div class="rating-big" aria-label="Valoración promedio">
      <p class="rating-big__stars" aria-hidden="true">${stars(avg)}</p>
      <div class="rating-big__values">
        <strong class="rating-big__score">${avg} <span>/ 5</span></strong>
        <span class="rating-big__count">${count} ${label}</span>
      </div>
    </div>
  `;
};

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

      ${ratingBigHTML(film)}

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

    <div class="reviews">${reviewsHTML(film)}</div>
  </section>
`;

// Cablea el star picker y el envío del form sobre el DOM recién montado.
// Se vuelve a llamar tras cada re-render porque mount() reemplaza el markup.
const wireRatingForm = (film) => {
  const form = document.querySelector(".review-form");
  if (!form) return;

  const starButtons = Array.from(form.querySelectorAll(".star-btn"));
  const starsError = form.querySelector('[data-error="stars"]');
  const nameField = form.querySelector("#reviewName");
  const nameError = form.querySelector('[data-error="name"]');
  const commentField = form.querySelector("#reviewComment");

  // Estrellas seleccionadas (0 = sin elegir). El picker no es un input nativo,
  // así que se valida a mano contra esta variable.
  let selectedStars = 0;

  const paintStars = (value) => {
    starButtons.forEach((button) => {
      const buttonValue = Number(button.dataset.value);
      button.setAttribute("aria-checked", buttonValue <= value ? "true" : "false");
    });
  };

  starButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedStars = Number(button.dataset.value);
      paintStars(selectedStars);
      starsError.hidden = true;
    });
  });

  const showFieldError = (errorNode) => {
    errorNode.hidden = false;
    errorNode.parentElement.classList.add("field--error");
  };

  const clearFieldError = (errorNode) => {
    errorNode.hidden = true;
    errorNode.parentElement.classList.remove("field--error");
  };

  // Limpia el error de nombre en cuanto el usuario empieza a corregir.
  nameField.addEventListener("input", () => clearFieldError(nameError));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const hasStars = selectedStars > 0;
    const nameIsValid = form.checkValidity();

    if (!hasStars) showFieldError(starsError);
    else starsError.hidden = true;

    if (!nameIsValid) showFieldError(nameError);
    else clearFieldError(nameError);

    if (!hasStars || !nameIsValid) return;

    const rating = {
      stars: selectedStars,
      name: nameField.value.trim(),
      comment: commentField.value.trim(),
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    saveRating(film.id, rating);
    alert("¡Gracias! Tu valoración se ha guardado.");

    // Re-render para que el promedio y la nueva reseña aparezcan; el form
    // recién montado se vuelve a cablear (selección y errores quedan limpios).
    renderPage(film);
  });
};

const renderPage = (film) => {
  mount(renderDetail(film));
  wireRatingForm(film);
};

const id = Number(getParam("id"));
const film = Number.isNaN(id) ? null : Data.byId(id);

if (!film) {
  location.replace("inicio.html");
} else {
  setActiveNav(catKeyForType(film.type));
  renderPage(film);
}
