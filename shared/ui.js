const stars = (rating) => {
  const filled = Math.round(rating);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
};

const filmMeta = (film) => {
  const base = `${film.year} · ${getFormattedType(film.type)}`;
  return film.runtime > 0 ? `${base} · ${film.runtime} min` : base;
};

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
