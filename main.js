const app = document.getElementById("app");
const links = document.querySelectorAll(".nav-link");

async function loadPage(page) {
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error("No se pudo cargar la página");
    const html = await res.text();
    app.innerHTML = html;

    const sec = app.querySelector("section");
    if (sec) sec.classList.add("active");
  } catch (err) {
    app.innerHTML = `<h1>Error 404</h1><p>Página no encontrada</p>`;
  }
}

// Manejo del hash en la URL
function router() {
  const hash = window.location.hash.substring(1) || "inicio";
  loadPage(hash);

  // actualizar estado del nav
  links.forEach(l => l.classList.remove("active"));
  const activeLink = document.querySelector(`.nav-link[href="#${hash}"]`);
  if (activeLink) activeLink.classList.add("active");
}

// Escuchar cambios en la URL
window.addEventListener("hashchange", router);
window.addEventListener("load", router);