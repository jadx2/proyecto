/*
 * inicio.js — CONTROLADOR DE LA PÁGINA DE INICIO (la home)
 * -------------------------------------------------------
 * QUÉ HACE: construye el contenido de inicio.html: un carrusel "hero" con
 * los destacados y unas franjas ("strips") de mejor valorados por categoría.
 * Luego activa el carrusel (auto-avance, botones y puntos).
 *
 * CUÁNDO SE CARGA: el ÚLTIMO, tras data.js → ui.js → helpers.js. Por eso
 * puede usar `Data` (data.js), `cardHTML`/`filmMeta` (ui.js) y `mount`
 * (helpers.js): todos ya existen cuando este archivo se ejecuta.
 *
 * FLUJO: pide datos a `Data` → los convierte en HTML con funciones de aquí
 * y de ui.js → `mount` los inserta en #app → `initHeroCarousel` les da vida.
 */

// heroSlideHTML(film, index, total): HTML de UNA diapositiva del carrusel.
// `index` es su posición (0,1,2...) y `total` cuántas hay (para accesibilidad).
// Solo la primera (index === 0) recibe la clase "hero__slide--active", que en
// el CSS la hace visible; las demás quedan ocultas hasta que el carrusel avance.
const heroSlideHTML = (film, index, total) => `
  <section
    class="hero__slide${index === 0 ? " hero__slide--active" : ""}"
    aria-roledescription="diapositiva"
    aria-label="Diapositiva ${index + 1} de ${total}"
  >
    <figure class="hero__media">
      <img loading="lazy" src="${film.poster}" alt="Póster de ${film.title}" />
    </figure>
    <div class="hero__content">
      <h2 class="hero__title">${film.title}</h2>
      <p class="hero__meta">${filmMeta(film)}</p>
      <p class="hero__synopsis">${film.synopsis}</p>
      <p class="hero__cta">
        <a href="../detalles/detalles.html?id=${film.id}">Ver detalle →</a>
      </p>
    </div>
  </section>
`;

// heroDotHTML(index): HTML de UN punto/indicador (los botoncitos para saltar
// de diapositiva). El primero nace "--active". Se muestra index + 1 porque las
// personas cuentan desde 1, pero los índices del programa empiezan en 0.
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

// heroHTML(films): arma el carrusel COMPLETO a partir de la lista de fichas.
// Dentro del molde: `films.map(...)` genera una diapositiva por ficha y
// `.join("")` une ese arreglo de textos en uno solo (sin comas). Más abajo, el
// mismo patrón con los puntos; en `map((_, i) => ...)` el "_" significa "no uso
// el valor, solo el índice i".
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

// stripHTML(config): arma una "franja" (un bloque por categoría) con su
// título, un enlace "Ver todo" y 4 tarjetas de las mejor valoradas.
// En el molde, `Data.topRated(config.type, 4)` pide las 4 mejor valoradas de ese
// tipo, `.map(cardHTML)` convierte cada una en una tarjeta (cardHTML, de ui.js) y
// `.join("")` las une en un solo texto.
const stripHTML = (config) => `
  <section class="strip" aria-label="${config.ariaLabel}">
    <header class="strip__header">
      <p class="strip__eyebrow">MEJOR VALORADOS</p>
      <h2 class="strip__title">${config.title}</h2>
      <p class="strip__viewall">
        <a href="../listado/${config.cat}.html">Ver todo →</a>
      </p>
    </header>
    ${Data.topRated(config.type, 4).map(cardHTML).join("")}
  </section>
`;

// STRIPS: configuración de las tres franjas de la home (una por categoría).
// Tenerlo en un arreglo evita repetir el mismo HTML tres veces a mano.
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

// renderHome(): junta TODO el HTML de la home: el carrusel (con las 5 mejor
// valoradas de cualquier tipo, por eso `undefined`) seguido de las 3 franjas.
const renderHome = () =>
  heroHTML(Data.topRated(undefined, 5)) + STRIPS.map(stripHTML).join("");

// Genera el HTML y lo inserta en #app (mount, de helpers.js). El `if` es una
// comprobación defensiva: solo llama si la función existe.
if (typeof renderHome === "function") mount(renderHome());

// initHeroCarousel(): da comportamiento al carrusel ya pintado en el DOM
// (cambiar de diapositiva con botones/puntos y auto-avance cada 8 s).
const initHeroCarousel = () => {
  // .querySelector(css) busca el PRIMER elemento que cumpla un selector CSS.
  const hero = document.querySelector("#app .hero");
  if (!hero) return; // si no hay carrusel en esta página, no hace nada

  // .querySelectorAll devuelve TODOS los que cumplen; Array.from lo convierte
  // en arreglo de verdad para poder usar .forEach, índices, etc.
  const slides = Array.from(hero.querySelectorAll(".hero__slide"));
  const dots = Array.from(hero.querySelectorAll(".hero__dot"));
  if (slides.length < 2) return; // con 0 o 1 diapositiva no hay nada que rotar

  const AUTO_ADVANCE_MS = 8000; // cada cuántos milisegundos avanza solo (8 s)
  // `let` (a diferencia de `const`) SÍ permite reasignar; estas dos variables
  // cambian con el tiempo: cuál se ve ahora y el id del temporizador activo.
  let currentIndex = 0;
  let timerId = null;

  // showSlide(nextIndex): oculta la diapositiva actual y muestra la pedida.
  const showSlide = (nextIndex) => {
    const total = slides.length;
    // El módulo `%` hace el efecto "circular": si pasas del final vuelve al
    // inicio y viceversa. (+ total evita índices negativos al ir hacia atrás.)
    const index = (nextIndex + total) % total;

    // classList.remove/add quita o pone una clase CSS sin tocar las demás.
    // Quitamos lo "activo" de la diapositiva y el punto actuales.
    slides[currentIndex].classList.remove("hero__slide--active");
    dots[currentIndex].classList.remove("hero__dot--active");
    dots[currentIndex].removeAttribute("aria-current"); // y su marca de accesibilidad

    // Y lo activamos en la nueva diapositiva y su punto.
    slides[index].classList.add("hero__slide--active");
    dots[index].classList.add("hero__dot--active");
    dots[index].setAttribute("aria-current", "true"); // marca para lectores de pantalla

    currentIndex = index; // recordamos cuál quedó visible
  };

  // startAuto(): pone en marcha el avance automático (si no estaba ya).
  const startAuto = () => {
    if (timerId !== null) return; // evita crear dos temporizadores a la vez
    // setInterval ejecuta la función cada X ms; guardamos su id para poder pararlo.
    timerId = setInterval(() => showSlide(currentIndex + 1), AUTO_ADVANCE_MS);
  };

  // stopAuto(): detiene el avance automático.
  const stopAuto = () => {
    clearInterval(timerId); // cancela el setInterval por su id
    timerId = null; // marcamos que ya no hay temporizador
  };

  // restartAuto(): reinicia el contador (tras una interacción del usuario).
  const restartAuto = () => {
    stopAuto();
    startAuto();
  };

  // goTo(index): salta a una diapositiva y reinicia el auto-avance.
  const goTo = (index) => {
    showSlide(index);
    restartAuto();
  };

  // addEventListener("click", fn): ejecuta `fn` cada vez que se hace clic.
  // Botón "Anterior": retrocede una diapositiva.
  hero
    .querySelector(".hero__nav--prev")
    .addEventListener("click", () => goTo(currentIndex - 1));
  // Botón "Siguiente": avanza una.
  hero
    .querySelector(".hero__nav--next")
    .addEventListener("click", () => goTo(currentIndex + 1));

  // Cada punto salta directo a su diapositiva (su posición = su índice).
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goTo(index));
  });

  // Pausa el auto-avance cuando el ratón/foco entra (para que el usuario lea)
  // y lo reanuda al salir. mouseenter/leave = ratón; focusin/out = teclado.
  hero.addEventListener("mouseenter", stopAuto);
  hero.addEventListener("mouseleave", startAuto);
  hero.addEventListener("focusin", stopAuto);
  hero.addEventListener("focusout", startAuto);

  dots[currentIndex].setAttribute("aria-current", "true"); // marca el punto inicial
  startAuto(); // arranca el carrusel
};

// Ejecuta la activación del carrusel al cargar la página.
initHeroCarousel();
