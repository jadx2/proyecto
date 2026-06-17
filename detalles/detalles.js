// Cat key ("peliculas" | "series" | "documentales") a partir del type interno.
const catKeyForType = (type) =>
  Object.keys(Categories).find((key) => Categories[key].type === type);

// El nav es estático: marcamos la categoría padre del título (una película
// resalta "Películas", etc.) buscando su enlace por el archivo de destino.
const markActiveNav = (catKey) => {
  const link = document.querySelector(`.nav-menu a[href$="${catKey}.html"]`);
  if (link) link.setAttribute("aria-current", "page");
};

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

const setText = (selector, value) => {
  document.querySelector(selector).textContent = value;
};

// Llena una <ul> existente con un <li> por elemento (géneros, reparto).
const fillList = (selector, items, itemClass) => {
  const list = document.querySelector(selector);
  items.forEach((value) => {
    const li = document.createElement("li");
    if (itemClass) li.className = itemClass;
    li.textContent = value;
    list.append(li);
  });
};

// Vuelca los datos del título en los huecos estáticos de detalles.html.
const fillDetail = (film) => {
  document.title = `${film.title} · Lumen`;

  const key = catKeyForType(film.type);
  const volver = document.querySelector("[data-volver]");
  volver.href = `../listado/${key}.html`;
  volver.textContent = `← Volver a ${Categories[key].label}`;

  const trailer = document.querySelector("[data-trailer]");
  trailer.src = film.trailer;
  trailer.title = `Tráiler de ${film.title}`;

  const poster = document.querySelector("[data-poster]");
  poster.src = film.poster;
  poster.alt = `Póster de ${film.title}`;

  setText("[data-eyebrow]", getFormattedType(film.type));
  setText("[data-titulo]", film.title);
  setText("[data-director]", film.director);
  setText("[data-sinopsis]", film.synopsis);
  setText("[data-direccion]", film.director);

  setText("[data-ficha-tipo]", getFormattedType(film.type));
  setText("[data-ficha-anio]", film.year);
  setText("[data-ficha-pais]", film.country);
  setText("[data-ficha-estreno]", formatReleaseDate(film.releaseDate));
  setText("[data-ficha-estudio]", film.studio);
  // Las series tienen runtime 0: se oculta la fila de duración.
  if (film.runtime > 0) {
    setText("[data-ficha-duracion]", `${film.runtime} min`);
  } else {
    document.querySelector("[data-ficha-duracion-row]").hidden = true;
  }

  fillList("[data-generos]", film.genres, "generos__item");
  fillList("[data-reparto]", film.cast);
};

// Promedio = rating base del título + estrellas guardadas en localStorage.
const paintRating = (film) => {
  const { avg, count } = avgRating(film);
  setText("[data-rating-stars]", stars(avg));
  setText("[data-rating-score]", avg);
  setText("[data-rating-count]", `${count} ${count === 1 ? "valoración" : "valoraciones"}`);
};

// Una reseña se arma con createElement/textContent (datos del usuario: nada
// de innerHTML para no inyectar markup desde el nombre o el comentario).
const reviewCard = (entry) => {
  const article = document.createElement("article");
  article.className = "review-card";

  const head = document.createElement("div");
  head.className = "review-card__head";

  const starsLine = document.createElement("p");
  starsLine.className = "review-card__stars";
  starsLine.setAttribute("aria-hidden", "true");
  starsLine.textContent = stars(entry.stars);

  const author = document.createElement("p");
  author.className = "review-card__author";
  author.textContent = entry.name;

  const date = document.createElement("p");
  date.className = "review-card__date";
  date.textContent = entry.date;

  head.append(starsLine, author, date);
  article.append(head);

  if (entry.comment) {
    const text = document.createElement("p");
    text.className = "review-card__text";
    text.textContent = entry.comment;
    article.append(text);
  }
  return article;
};

const paintReviews = (film) => {
  const container = document.querySelector("[data-reviews]");
  container.textContent = "";

  const ratings = loadRatings(film.id);
  if (ratings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "reviews__empty";
    empty.textContent = "Aún no hay valoraciones. ¡Sé el primero en opinar!";
    container.append(empty);
    return;
  }
  ratings.forEach((entry) => container.append(reviewCard(entry)));
};

// Cablea el star picker y el envío del form (estático en el HTML). Tras
// guardar, repinta promedio y reseñas y limpia el formulario; no hace falta
// re-cablear porque el markup del form no se vuelve a crear.
const wireRatingForm = (film) => {
  const form = document.querySelector(".review-form");
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

    const hasStars = selectedStars > 0;
    const nameIsValid = form.checkValidity();

    if (!hasStars) showFieldError(starsError);
    else starsError.hidden = true;

    if (!nameIsValid) showFieldError(nameError);
    else clearFieldError(nameError);

    if (!hasStars || !nameIsValid) return;

    saveRating(film.id, {
      stars: selectedStars,
      name: nameField.value.trim(),
      comment: commentField.value.trim(),
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });

    alert("¡Gracias! Tu valoración se ha guardado.");

    paintRating(film);
    paintReviews(film);
    form.reset();
    selectedStars = 0;
    paintStars(0);
  });
};

const id = Number(getParam("id"));
const film = Number.isNaN(id) ? null : Data.byId(id);

if (!film) {
  location.replace("../inicio/inicio.html");
} else {
  markActiveNav(catKeyForType(film.type));
  fillDetail(film);
  paintRating(film);
  paintReviews(film);
  wireRatingForm(film);
}
