const loadRatings = (id) => {
  try {
    return JSON.parse(localStorage.getItem(`ratings:${id}`)) || [];
  } catch {
    return [];
  }
};

const saveRating = (id, rating) => {
  const ratings = loadRatings(id);
  ratings.unshift(rating);
  localStorage.setItem(`ratings:${id}`, JSON.stringify(ratings));
  return ratings;
};

const avgRating = (film) => {
  const userStars = loadRatings(film.id).map((r) => r.stars);
  const all = [film.rating, ...userStars];
  const avg = all.reduce((sum, n) => sum + n, 0) / all.length;
  return { avg: Math.round(avg * 10) / 10, count: all.length };
};

const Categories = {
  peliculas: { type: "movie", label: "Películas" },
  series: { type: "series", label: "Series" },
  documentales: { type: "documentary", label: "Documentales" },
};

const getFormattedType = (type) => {
  const match = Object.values(Categories).find(
    (category) => category.type === type,
  );
  return match ? match.label : "";
};

const getParam = (name, fallback = undefined) => {
  const value = new URLSearchParams(location.search).get(name);
  return value === null || value === "" ? fallback : value;
};

const mount = (html) => {
  document.getElementById("app").innerHTML = html;
};
