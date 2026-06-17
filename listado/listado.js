const slug = getParam("cat", "peliculas");
const type = (Categories[slug] || Categories.peliculas).type;
const page = Number(getParam("page", 1)) || 1;

if (typeof renderList === "function") mount(renderList(type, page));
