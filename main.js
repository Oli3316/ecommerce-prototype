const app = document.getElementById("app");
const links = document.querySelectorAll(".nav-link");
const loadedModals = {};

const API_KEY = "patT7TBAAgZsmibHM.e5a4d8f4ed88a551fe7cab0b63d524f3e1382687766b2dc6daf62c523fb551be";
const BASE_ID = "appjSiHXlFMyEwB5b";
const TABLE_NAME = "Products";

// Inicializar EmailJS
(function() { emailjs.init("SiJdhKM8cxQrVxJ7H"); })();

// --- Router SPA ---
window.addEventListener("hashchange", router);
window.addEventListener("load", router);

async function router() {
  const hash = window.location.hash.substring(1) || "inicio";
  await loadPage(hash);

  links.forEach(l => l.classList.remove("active"));
  const activeLink = document.querySelector(`.nav-link[href="#${hash}"]`);
  if (activeLink) activeLink.classList.add("active");
}

// --- Load page ---
async function loadPage(page) {
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error("No se pudo cargar la página");
    const html = await res.text();
    app.innerHTML = html;

    initPageFeatures();

    const sec = app.querySelector("section");
    if (sec) sec.classList.add("active");

    // Renderizar productos si ya están cargados
    if (window.productosGlobales && document.getElementById("productos-container")) {
      renderProductos(window.productosGlobales, document.getElementById("productos-container"));
    }

  } catch (err) {
    console.error(err);
    app.innerHTML = `<h1>Error 404</h1><p>Página no encontrada</p>`;
  }
}

// --- Inicializar funcionalidades de la página ---
function initPageFeatures() {
  const contenedor = document.getElementById("productos-container");
  const selectCategoria = document.getElementById("filtroCategoria");

  if (contenedor && selectCategoria && window.productosGlobales) {
    renderProductos(window.productosGlobales, contenedor);
    cargarCategorias(window.productosGlobales, selectCategoria);

    selectCategoria.addEventListener("change", () => {
      const categoria = selectCategoria.value;
      const productosFiltrados = filtrarProductos(window.productosGlobales, categoria);
      renderProductos(productosFiltrados, contenedor);
    });
  }

  // Formulario de contacto
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      emailjs.sendForm('service_1102u5y', 'template_7qigike', this)
        .then(() => {
          form.reset();
          showToast("✅ Mensaje enviado correctamente");
          setTimeout(() => window.location.hash = "#inicio", 2000);
        })
        .catch(err => {
          console.error("Error al enviar el mensaje:", err);
          showToast("❌ Error al enviar el mensaje", true);
        });
    });
  }
}

// --- Toast ---
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.innerHTML = message;
  toast.style.cssText = `
    position:fixed; top:20px; right:20px;
    background-color:#fff; color:#000;
    padding:12px 20px; border-radius:8px;
    box-shadow:0 4px 6px rgba(0,0,0,0.2);
    z-index:9999; font-weight:bold; font-size:14px;
    opacity:0; transition:opacity 0.3s ease;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = "1");
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
}

// --- Productos ---
function obtenerURLImagen(imagen) {
  if (typeof imagen === "string") return imagen.trim();
  if (Array.isArray(imagen) && imagen.length && imagen[0].url) return imagen[0].url;
  return "";
}

async function obtenerProductos() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  const data = await response.json();
  if (!data.records) throw new Error("No se encontraron records en Airtable.");
  return data.records;
}

function renderProductos(productos, contenedor) {
  contenedor.innerHTML = "";
  productos.forEach(producto => {
    const imagenURL = obtenerURLImagen(producto.fields.Imagen) || "https://via.placeholder.com/300x200";
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-3";
    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${imagenURL}" class="card-img-top" alt="${producto.fields.Nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${producto.fields.Nombre}</h5>
          <p class="card-text">${producto.fields.Descripcion || ""}</p>
          <div class="mt-auto">
            <p class="fw-bold">$${producto.fields.Precio}</p>
            <a href="#" class="btn btn-primary w-100 btn-detalle">Ver detalle</a>
          </div>
        </div>
      </div>`;
    col.querySelector(".btn-detalle").addEventListener("click", e => {
      e.preventDefault();
      mostrarDetalleProducto(producto);
    });
    contenedor.appendChild(col);
  });
}

function cargarCategorias(productos, selectCategoria) {
  selectCategoria.innerHTML = `<option value="todas">Todas</option>`;
  const categorias = new Set();
  productos.forEach(p => { if (p.fields.Categoria) categorias.add(p.fields.Categoria.toLowerCase()); });
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = capitalize(cat);
    selectCategoria.appendChild(option);
  });
}

function filtrarProductos(productos, categoria) {
  if (categoria === "todas") return productos;
  return productos.filter(p => p.fields.Categoria && p.fields.Categoria.toLowerCase() === categoria);
}

// --- Modal detalle producto ---
async function mostrarDetalleProducto(producto) {
  if (!loadedModals["detalleProducto"]) {
    const res = await fetch("modales/detalleProducto.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);
    loadedModals["detalleProducto"] = true;
  }
  document.getElementById("detalleNombre").textContent = producto.fields.Nombre;
  document.getElementById("detalleDescripcion").textContent = producto.fields.Descripcion || "";
  document.getElementById("detallePrecio").textContent = `$${producto.fields.Precio}`;
  document.getElementById("detalleImagen").src = obtenerURLImagen(producto.fields.Imagen) || "https://via.placeholder.com/300x200";

  const btn = document.getElementById("btnAgregarCarritoDetalle");
  btn.replaceWith(btn.cloneNode(true));
  document.getElementById("btnAgregarCarritoDetalle").addEventListener("click", () => {
    const metodoPago = document.getElementById("metodoPago").value;
    showModal("confirmar", { text: `¿Deseas agregar este producto al carrito con pago: ${metodoPago}?`,
      onConfirm: () => showModal("exito", { text: "Producto agregado al carrito correctamente" })
    });
  });

  new bootstrap.Modal(document.getElementById("modalDetalleProducto")).show();
}

// --- Cargar productos al inicio ---
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const productos = await obtenerProductos();
    window.productosGlobales = productos;
    // Llamamos router para renderizar la página actual
    router();
  } catch (err) {
    console.error("Error al obtener productos desde Airtable:", err);
  }
});

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
