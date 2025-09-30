const app = document.getElementById("app");
const links = document.querySelectorAll(".nav-link");
const loadedModals = {};

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

async function showModal(name, options = {}) {
  try {
    // si el modal ya está en el DOM, no hacemos fetch de nuevo
    if (!loadedModals[name]) {
      const res = await fetch(`modales/${name}.html`);
      if (!res.ok) throw new Error("No se pudo cargar el modal");
      const html = await res.text();
      document.body.insertAdjacentHTML("beforeend", html);
      loadedModals[name] = true;
    }

    const modalEl = document.getElementById(`modal${capitalize(name)}`);
    if (!modalEl) throw new Error("No se encontró el modal en el DOM");

    // inicializamos el modal de Bootstrap
    const modal = new bootstrap.Modal(modalEl);

    // que hace si es un modal confirmar
    if (options.onConfirm) {
      const btnConfirm = modalEl.querySelector("#confirmarAccion");
      if (btnConfirm) {
        // removemos listeners anteriores para no duplicar
        btnConfirm.replaceWith(btnConfirm.cloneNode(true));
        modalEl.querySelector("#confirmarAccion").addEventListener("click", () => {
          options.onConfirm();
          modal.hide();
        });
      }
    }

    modal.show();
  } catch (err) {
    console.error(err);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

// showModal('error')

app.addEventListener("click", (e) => {
  // ACA DENTRO ESCUCHARIAMOS A LOS BOTONES
  if (e.target && e.target.id === "btn-add") {
    e.preventDefault();
    showModal("confirmar", {
      text: "¿Deseas agregar este producto al carrito?",
      onConfirm: () => {
        console.log("Producto agregado ✅");
        showModal("exito", { text: "Producto agregado al carrito correctamente" });
      }
    });
  }

    // if (e.target && e.target.id === "btn-remove") {
    // e.preventDefault();
    // }
});