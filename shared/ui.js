/*
 * ui.js — PIEZAS VISUALES REUTILIZABLES (genera HTML a partir de datos)
 * --------------------------------------------------------------------
 * QUÉ HACE: contiene funciones que reciben una ficha (`film`) y devuelven
 * una CADENA de HTML lista para insertar en la página. Son como "moldes":
 * se reutilizan en la home y en el listado para que todas las tarjetas se
 * vean iguales.
 *
 * CUÁNDO SE CARGA: después de data.js. Usa `getFormattedType` (definida en
 * helpers.js); por eso el orden de carga importa. Define globales `stars`,
 * `filmMeta` y `cardHTML`, que usan inicio.js, listado y detalles.js.
 *
 * TÉCNICA: los "template literals" usan comillas invertidas `...` y permiten
 * meter valores con `${...}` y escribir HTML de varias líneas cómodamente.
 */

// stars(rating): convierte un número (0-5) en estrellas de texto.
const stars = (rating) => {
  const filled = Math.round(rating); // redondea: 4.4 → 4 estrellas llenas
  // "★".repeat(n) repite el carácter n veces; juntamos llenas + vacías
  // hasta sumar 5 en total (5 - filled estrellas vacías "☆").
  return "★".repeat(filled) + "☆".repeat(5 - filled);
};

// filmMeta(film): arma la línea de metadatos "Año · Tipo · Duración".
const filmMeta = (film) => {
  // texto base con año y tipo traducido; " · " es solo un separador visual.
  const base = `${film.year} · ${getFormattedType(film.type)}`;
  // si tiene duración (>0, p.ej. películas) la añade; si no (series), la omite.
  return film.runtime > 0 ? `${base} · ${film.runtime} min` : base;
};

// cardHTML(film): devuelve el HTML de UNA tarjeta de catálogo (la que se ve
// en la cuadrícula). Recibe una ficha y devuelve texto HTML.
// Dos detalles del molde de abajo (no se pueden comentar DENTRO de las comillas
// invertidas, por eso se explican aquí):
//  - el <a href="...detalles.html?id=${film.id}"> pasa el id por la URL para que
//    la página de detalle sepa qué ficha mostrar.
//  - loading="lazy" en el <img> hace que la imagen se descargue solo cuando está
//    por entrar en pantalla (la home carga más rápido).
const cardHTML = (film) => `
  <article class="film-card">
    <a href="../detalles/detalles.html?id=${film.id}">
      <figure class="poster">
        <img loading="lazy" src="${film.poster}" alt="Póster de ${film.title}" />
      </figure>
      <h3 class="film-card__title">${film.title}</h3>
      <p class="film-card__director">${film.director}</p>
      <p class="film-card__rating">
        <span aria-hidden="true">${stars(film.rating)}</span> ${film.rating} de 5
      </p>
      <p class="film-card__meta">${filmMeta(film)}</p>
    </a>
  </article>
`;
