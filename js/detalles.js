const id = Number(getParam("id"));
const film = Number.isNaN(id) ? null : Data.byId(id);

if (!film) {
  location.replace("inicio.html");
} else if (typeof renderDetail === "function") {
  mount(renderDetail(film));
}
