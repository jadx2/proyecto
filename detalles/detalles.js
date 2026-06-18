/*
 * detalles.js — CONTROLADOR DE LA PÁGINA DE DETALLE
 * -------------------------------------------------
 * QUÉ HACE: muestra TODA la información de UNA película/serie/documental:
 * póster, tráiler, ficha técnica, géneros, reparto y las valoraciones que
 * dejan los usuarios (con su formulario para puntuar). ¿Cuál mostrar? La que
 * indique el id de la URL: detalles.html?id=7.
 *
 * CUÁNDO SE CARGA: el último, tras data.js → ui.js → helpers.js. Usa `Data`
 * (datos), `getParam`/`Categories`/`loadRatings`/`saveRating`/`avgRating`/
 * `getFormattedType` (helpers.js) y `stars` (ui.js).
 *
 * A DIFERENCIA de la home/listado, aquí el HTML ya existe en detalles.html
 * con "huecos" marcados por atributos data-* (p.ej. [data-titulo]); este
 * script RELLENA esos huecos con los datos de la ficha.
 *
 * FLUJO (ver el final del archivo): lee el id → busca la ficha → si no
 * existe redirige al inicio → si existe, rellena todo y conecta el formulario.
 */

// catKeyForType(type): operación inversa a las categorías. Dado un tipo en
// inglés ("movie") devuelve la clave en español ("peliculas").
// Object.keys saca las claves del diccionario; .find busca la que corresponde.
const catKeyForType = (type) =>
  Object.keys(Categories).find((key) => Categories[key].type === type);

// markActiveNav(catKey): resalta en el menú el enlace de la categoría actual.
const markActiveNav = (catKey) => {
  // Selector CSS con [href$="..."] = enlaces cuyo href TERMINA en ese texto
  // (p.ej. el que apunta a "peliculas.html"). `$=` significa "termina en".
  const link = document.querySelector(`.nav-menu a[href$="${catKey}.html"]`);
  // aria-current="page" indica a lectores de pantalla "esta es la página actual".
  if (link) link.setAttribute("aria-current", "page");
};

// MONTHS_ES: nombres de los meses en español, en orden. Sirve para traducir
// el número de mes de una fecha a su nombre (enero = posición 0).
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

// formatReleaseDate(iso): convierte "2026-05-01" en "1 mayo 2026".
const formatReleaseDate = (iso) => {
  // .split("-") parte el texto por los guiones → ["2026","05","01"].
  // La "desestructuración" [year, month, day] reparte cada parte en su variable.
  const [year, month, day] = iso.split("-");
  // Number("05") → 5 (quita el cero a la izquierda). El mes - 1 porque el
  // arreglo MONTHS_ES empieza en 0 (mayo es la posición 4).
  return `${Number(day)} ${MONTHS_ES[Number(month) - 1]} ${year}`;
};

// setText(selector, value): pone TEXTO dentro del elemento que indique el
// selector. Es el "rellenar un hueco" que se repite mucho en esta página.
const setText = (selector, value) => {
  // .textContent escribe texto PLANO (no interpreta etiquetas HTML), por eso
  // es más SEGURO que innerHTML: si el dato trae "<b>", se ve literal y no
  // ejecuta nada. Ideal para datos que se muestran tal cual.
  document.querySelector(selector).textContent = value;
};

// fillList(selector, items, itemClass): crea un <li> por cada elemento de
// `items` y los mete en la lista indicada. Se usa para géneros y reparto.
const fillList = (selector, items, itemClass) => {
  const list = document.querySelector(selector); // la <ul>/<ol> destino
  items.forEach((value) => {
    // document.createElement crea un elemento nuevo EN MEMORIA (aún no se ve).
    const li = document.createElement("li");
    if (itemClass) li.className = itemClass; // clase CSS opcional
    li.textContent = value; // su texto (seguro, ver setText)
    list.append(li); // .append lo agrega como hijo: ahora SÍ aparece en la página
  });
};

// fillDetail(film): rellena la parte fija del detalle (título, enlace de
// volver, tráiler, póster, ficha técnica, géneros y reparto) con los datos
// de la ficha recibida.
const fillDetail = (film) => {
  // document.title es el texto de la pestaña del navegador.
  document.title = `${film.title} · Lumen`;

  // Enlace "Volver a <categoría>": apunta al listado correcto y muestra el
  // nombre en español de la categoría.
  const key = catKeyForType(film.type);
  const volver = document.querySelector("[data-volver]");
  volver.href = `../listado/${key}.html`; // .href cambia el destino del enlace
  volver.textContent = `← Volver a ${Categories[key].label}`;

  // Tráiler: el <iframe> recibe la URL del vídeo y un título accesible.
  const trailer = document.querySelector("[data-trailer]");
  trailer.src = film.trailer; // .src es la fuente (URL) del iframe/imagen
  trailer.title = `Tráiler de ${film.title}`;

  // Póster: imagen y su texto alternativo (alt), que se lee si la imagen falla.
  const poster = document.querySelector("[data-poster]");
  poster.src = film.poster;
  poster.alt = `Póster de ${film.title}`;

  // A partir de aquí, rellenar cada "hueco" de texto con setText:
  setText("[data-eyebrow]", getFormattedType(film.type)); // tipo traducido
  setText("[data-titulo]", film.title); // título
  setText("[data-director]", film.director); // director (subtítulo)
  setText("[data-sinopsis]", film.synopsis); // sinopsis
  setText("[data-direccion]", film.director); // director (fila de la ficha)

  // Ficha técnica:
  setText("[data-ficha-tipo]", getFormattedType(film.type));
  setText("[data-ficha-anio]", film.year);
  setText("[data-ficha-pais]", film.country);
  setText("[data-ficha-estreno]", formatReleaseDate(film.releaseDate));
  setText("[data-ficha-estudio]", film.studio);
  // La duración solo aplica a películas: si runtime > 0 la muestra; si es 0
  // (series), oculta la fila completa con .hidden = true.
  if (film.runtime > 0) {
    setText("[data-ficha-duracion]", `${film.runtime} min`);
  } else {
    document.querySelector("[data-ficha-duracion-row]").hidden = true;
  }

  // Listas: géneros (cada uno con su clase CSS) y reparto.
  fillList("[data-generos]", film.genres, "generos__item");
  fillList("[data-reparto]", film.cast);
};

// paintRating(film): pinta el resumen de valoración (estrellas, nota media y
// cuántas valoraciones hay). Se vuelve a llamar cada vez que el usuario opina.
const paintRating = (film) => {
  // Desestructuración: avgRating devuelve { avg, count } y aquí los separamos.
  const { avg, count } = avgRating(film);
  setText("[data-rating-stars]", stars(avg)); // estrellas dibujadas
  setText("[data-rating-score]", avg); // número (p.ej. 4.4)
  // Singular/plural según el conteo: "1 valoración" vs "3 valoraciones".
  setText(
    "[data-rating-count]",
    `${count} ${count === 1 ? "valoración" : "valoraciones"}`,
  );
};

// reviewCard(entry): construye (en memoria) la tarjeta de UNA reseña a partir
// de un registro guardado. Devuelve el elemento <article> ya armado.
const reviewCard = (entry) => {
  // Contenedor principal de la reseña.
  const article = document.createElement("article");
  article.className = "review-card";

  // Cabecera: estrellas + autor + fecha.
  const head = document.createElement("div");
  head.className = "review-card__head";

  // Línea de estrellas (aria-hidden: decorativa, los lectores la ignoran).
  const starsLine = document.createElement("p");
  starsLine.className = "review-card__stars";
  starsLine.setAttribute("aria-hidden", "true");
  starsLine.textContent = stars(entry.stars);

  // Nombre de quien opinó.
  const author = document.createElement("p");
  author.className = "review-card__author";
  author.textContent = entry.name;

  // Fecha de la reseña.
  const date = document.createElement("p");
  date.className = "review-card__date";
  date.textContent = entry.date;

  // .append acepta varios hijos a la vez: metemos los tres en la cabecera...
  head.append(starsLine, author, date);
  article.append(head); // ...y la cabecera en el artículo.

  // El comentario es opcional: solo se agrega si existe.
  if (entry.comment) {
    const text = document.createElement("p");
    text.className = "review-card__text";
    text.textContent = entry.comment;
    article.append(text);
  }
  return article; // se devuelve para que quien llame decida dónde colocarlo
};

// paintReviews(film): pinta la LISTA de reseñas guardadas (o un mensaje si no
// hay ninguna). Se vuelve a llamar tras cada valoración nueva.
const paintReviews = (film) => {
  const container = document.querySelector("[data-reviews]");
  container.textContent = ""; // vacía el contenedor antes de volver a pintar

  const ratings = loadRatings(film.id); // valoraciones guardadas de esta ficha
  if (ratings.length === 0) {
    // Sin reseñas: mostrar un mensaje invitando a opinar.
    const empty = document.createElement("p");
    empty.className = "reviews__empty";
    empty.textContent = "Aún no hay valoraciones. ¡Sé el primero en opinar!";
    container.append(empty);
    return; // y salir (no hay tarjetas que pintar)
  }
  // Por cada reseña, crea su tarjeta (reviewCard) y la añade al contenedor.
  ratings.forEach((entry) => container.append(reviewCard(entry)));
};

// wireRatingForm(film): "conecta los cables" del formulario para valorar:
// seleccionar estrellas, validar, guardar y refrescar la pantalla.
const wireRatingForm = (film) => {
  // Tomamos referencias a los elementos del formulario que vamos a usar.
  const form = document.querySelector(".review-form");
  const starButtons = Array.from(form.querySelectorAll(".star-btn")); // los 5 botones-estrella
  const starsError = form.querySelector('[data-error="stars"]'); // mensaje de error de estrellas
  const nameField = form.querySelector("#reviewName"); // campo del nombre (# = buscar por id)
  const nameError = form.querySelector('[data-error="name"]'); // mensaje de error del nombre
  const commentField = form.querySelector("#reviewComment"); // campo del comentario

  // Recuerda cuántas estrellas eligió el usuario (cambia, por eso `let`).
  let selectedStars = 0;

  // paintStars(value): marca como "encendidas" las estrellas hasta `value`.
  const paintStars = (value) => {
    starButtons.forEach((button) => {
      // .dataset.value lee el atributo data-value="N" del botón en HTML.
      const buttonValue = Number(button.dataset.value);
      // aria-checked le dice a lectores de pantalla si está marcada o no.
      button.setAttribute(
        "aria-checked",
        buttonValue <= value ? "true" : "false",
      );
    });
  };

  // Al hacer clic en una estrella: guardar su valor, repintar y ocultar error.
  starButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedStars = Number(button.dataset.value);
      paintStars(selectedStars);
      starsError.hidden = true;
    });
  });

  // showFieldError / clearFieldError: muestran u ocultan el mensaje de error
  // de un campo y resaltan/quitan el resaltado de su contenedor (parentElement).
  const showFieldError = (errorNode) => {
    errorNode.hidden = false;
    errorNode.parentElement.classList.add("field--error");
  };

  const clearFieldError = (errorNode) => {
    errorNode.hidden = true;
    errorNode.parentElement.classList.remove("field--error");
  };

  // Evento "input": se dispara mientras el usuario escribe; aquí limpia el
  // error del nombre en cuanto empieza a corregirlo.
  nameField.addEventListener("input", () => clearFieldError(nameError));

  // Evento "submit": al enviar el formulario.
  form.addEventListener("submit", (event) => {
    // .preventDefault() evita que la página se recargue (comportamiento por
    // defecto del formulario); así lo manejamos nosotros con JS.
    event.preventDefault();

    const hasStars = selectedStars > 0; // ¿eligió al menos una estrella?
    const nameIsValid = form.checkValidity(); // validación nativa del HTML (required, etc.)

    // Muestra u oculta cada error según corresponda.
    if (!hasStars) showFieldError(starsError);
    else starsError.hidden = true;

    if (!nameIsValid) showFieldError(nameError);
    else clearFieldError(nameError);

    // Si falta algo, detener aquí (no guardar).
    if (!hasStars || !nameIsValid) return;

    // Todo válido: guardar la valoración (saveRating, de helpers.js).
    saveRating(film.id, {
      stars: selectedStars,
      name: nameField.value.trim(), // .value = lo escrito; .trim() quita espacios sobrantes
      comment: commentField.value.trim(),
      // new Date() = fecha de hoy; toLocaleDateString la formatea en español.
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });

    alert("¡Gracias! Tu valoración se ha guardado."); // aviso emergente simple

    // Refrescar la pantalla con lo recién guardado y limpiar el formulario.
    paintRating(film);
    paintReviews(film);
    form.reset(); // vacía los campos
    selectedStars = 0;
    paintStars(0); // apaga las estrellas
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
