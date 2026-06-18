/*
 * helpers.js — UTILIDADES COMPARTIDAS (lógica reutilizable)
 * --------------------------------------------------------
 * QUÉ HACE: reúne funciones pequeñas que varias páginas necesitan:
 * guardar/leer valoraciones del usuario, calcular promedios, traducir
 * categorías y leer parámetros de la URL.
 *
 * CUÁNDO SE CARGA: después de data.js y ui.js, antes del script de cada
 * página. Depende de nada externo salvo APIs del navegador (localStorage,
 * URLSearchParams). Define globales que sí usan los scripts de página:
 * `loadRatings`, `saveRating`, `avgRating`, `Categories`,
 * `getFormattedType`, `getParam`, `mount`.
 *
 * CONCEPTOS: una "arrow function" `(args) => { ... }` es una forma corta de
 * escribir funciones. Si el cuerpo es una sola expresión, se puede omitir
 * `return` y las llaves.
 */

// loadRatings(id): lee del navegador las valoraciones guardadas para una
// película concreta. Devuelve un arreglo (vacío si no hay nada).
const loadRatings = (id) => {
  // try/catch: intenta leer; si algo falla, en vez de romper la página,
  // ejecuta el catch y devuelve [].
  try {
    // localStorage = almacén del navegador que conserva texto entre visitas.
    // .getItem(clave) devuelve el texto guardado (o null si no existe).
    // La clave usa una plantilla `ratings:${id}` (template literal): el
    // `${...}` inserta el valor de `id`, p.ej. "ratings:7".
    // JSON.parse(...) convierte ese texto de vuelta en arreglo/objeto JS.
    // `|| []`: si el resultado es null/undefined, usa un arreglo vacío.
    return JSON.parse(localStorage.getItem(`ratings:${id}`)) || [];
  } catch {
    return []; // ante cualquier error (texto corrupto, etc.), arreglo vacío
  }
};

// saveRating(id, rating): añade una valoración nueva a la película `id` y
// la guarda en el navegador. Devuelve la lista actualizada.
const saveRating = (id, rating) => {
  const ratings = loadRatings(id); // parte de lo que ya había guardado
  ratings.unshift(rating); // .unshift mete el nuevo elemento AL INICIO del arreglo
  // .setItem(clave, texto) guarda en el navegador; JSON.stringify convierte
  // el arreglo a texto, porque localStorage solo almacena cadenas.
  localStorage.setItem(`ratings:${id}`, JSON.stringify(ratings));
  return ratings;
};

// avgRating(film): calcula el promedio de estrellas combinando la valoración
// base de la ficha con las que dejaron los usuarios. Devuelve { avg, count }.
const avgRating = (film) => {
  // .map() transforma cada elemento: de cada valoración `r` toma solo `r.stars`
  // y crea un arreglo solo con números de estrellas.
  const userStars = loadRatings(film.id).map((r) => r.stars);
  // junta la nota base con las del usuario usando el "spread" (...).
  const all = [film.rating, ...userStars];
  // .reduce() recorre el arreglo acumulando una suma (empieza... ver final);
  // luego divide entre la cantidad para obtener el promedio.
  const avg = all.reduce((sum, n) => sum + n, 0) / all.length;
  // Math.round(avg * 10) / 10 redondea a 1 decimal (p.ej. 4.36 → 4.4).
  return { avg: Math.round(avg * 10) / 10, count: all.length };
};

// `Categories`: tabla que conecta la categoría en español de la URL
// (?cat=peliculas) con el `type` en inglés de los datos y su etiqueta visible.
// Es el "diccionario" central peliculas→movie, series→series, etc.
const Categories = {
  peliculas: { type: "movie", label: "Películas" },
  series: { type: "series", label: "Series" },
  documentales: { type: "documentary", label: "Documentales" },
};

// getFormattedType(type): recibe un tipo en inglés ("movie") y devuelve su
// etiqueta bonita en español ("Películas"). Si no la encuentra, "".
const getFormattedType = (type) => {
  // Object.values(Categories) saca los valores del diccionario como arreglo;
  // .find() busca el que tenga ese `type`.
  const match = Object.values(Categories).find(
    (category) => category.type === type,
  );
  // operador ternario condición ? siVerdadero : siFalso
  return match ? match.label : "";
};

// getParam(name, fallback): lee un parámetro de la URL (lo que va tras "?").
// Ej.: en detalles.html?id=7, getParam("id") devuelve "7".
const getParam = (name, fallback = undefined) => {
  // location.search es la parte "?id=7" de la URL. URLSearchParams la analiza
  // y .get(name) devuelve el valor del parámetro pedido (o null si no está).
  const value = new URLSearchParams(location.search).get(name);
  // si no vino o vino vacío, devuelve el valor de respaldo (fallback).
  return value === null || value === "" ? fallback : value;
};

// mount(html): inyecta una cadena de HTML dentro del contenedor #app.
const mount = (html) => {
  // document.getElementById("app") busca el elemento con id="app".
  // .innerHTML = html REEMPLAZA todo su contenido por ese HTML.
  // (innerHTML interpreta etiquetas; aquí lo controlamos nosotros, no es
  // texto del usuario, por eso es seguro usarlo.)
  document.getElementById("app").innerHTML = html;
};
