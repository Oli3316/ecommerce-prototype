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
    const contenedor = document.getElementById("productos-container");
    if (window.productosGlobales && contenedor) {
      renderProductos(window.productosGlobales, contenedor);
    }

  } catch (err) {
    console.error(err);
    app.innerHTML = `<h1>Error 404</h1><p>Página no encontrada</p>`;
  }
}

// --- Inicializar funcionalidades de la página ---
function initPageFeatures() {
  // --- Productos y filtros ---
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

  // --- Carrusel Destacados ---
  const carouselContainer = document.querySelector("#carouselDestacados .carousel-inner");
  if (carouselContainer && window.productosGlobales) {
    renderDestacados();
  }

  // --- Formulario de contacto ---
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

// --- Carrusel Coverflow 3D ---
let indexCoverflow = 0;
let isDragging = false;
let startX = 0;

function renderDestacados() {
  if (!window.productosGlobales) return;

  const destacados = window.productosGlobales.filter(p => p.fields.Destacado === true);
  const carouselInner = document.querySelector("#carouselDestacados .carousel-inner");
  const indicators = document.querySelector("#carouselDestacados .carousel-indicators");
  if (!carouselInner) return;

  carouselInner.innerHTML = "";
  indicators.innerHTML = "";

  destacados.forEach((producto, i) => {
    const imagenURL = obtenerURLImagen(producto.fields.Imagen) || "https://via.placeholder.com/300x200";

    const item = document.createElement("div");
    item.className = `carousel-item${i === 0 ? " active" : ""}`;
    item.innerHTML = `
      <div class="card shadow-sm">
        <img src="${imagenURL}" class="card-img-top" alt="${producto.fields.Nombre}">
        <div class="card-body text-center">
          <h5 class="card-title">${producto.fields.Nombre}</h5>
          <p class="card-text">${producto.fields.Descripcion || ""}</p>
          <p class="fw-bold">$${producto.fields.Precio}</p>
          <a href="#" class="btn btn-primary btn-detalle">Ver detalle</a>
        </div>
      </div>
    `;
    item.querySelector(".btn-detalle").addEventListener("click", e => {
      e.preventDefault();
      mostrarDetalleProducto(producto);
    });
    carouselInner.appendChild(item);

    // Indicadores
    const btn = document.createElement("button");
    btn.addEventListener("click", () => {
      indexCoverflow = i;
      updateCoverflow();
    });
    indicators.appendChild(btn);
  });

  // Prev/Next botones
  document.querySelector("#carouselDestacados .carousel-prev").onclick = () => {
    indexCoverflow = (indexCoverflow - 1 + destacados.length) % destacados.length;
    updateCoverflow();
  };
  document.querySelector("#carouselDestacados .carousel-next").onclick = () => {
    indexCoverflow = (indexCoverflow + 1) % destacados.length;
    updateCoverflow();
  };

  // Drag/Swipe
  carouselInner.addEventListener("mousedown", e => { isDragging = true; startX = e.clientX; });
  carouselInner.addEventListener("mouseup", e => { handleDragEnd(e.clientX - startX, destacados.length); });
  carouselInner.addEventListener("mouseleave", e => { if(isDragging) handleDragEnd(e.clientX - startX, destacados.length); });
  carouselInner.addEventListener("touchstart", e => { isDragging = true; startX = e.touches[0].clientX; });
  carouselInner.addEventListener("touchend", e => { handleDragEnd(e.changedTouches[0].clientX - startX, destacados.length); });

  updateCoverflow();
}

function handleDragEnd(diffX, length) {
  if (!isDragging) return;
  isDragging = false;
  if (diffX > 50) indexCoverflow = (indexCoverflow - 1 + length) % length;
  else if (diffX < -50) indexCoverflow = (indexCoverflow + 1) % length;
  updateCoverflow();
}

function updateCoverflow() {
  const items = document.querySelectorAll("#carouselDestacados .carousel-item");
  const offset = 210; // separación lateral entre productos

  items.forEach((item, i) => {
    item.classList.remove("active", "prev", "next");
    item.style.opacity = 0.3;
    item.style.transform = "translateX(-50%) scale(0.8)";

    if (i === indexCoverflow) {
      item.classList.add("active");
      item.style.opacity = 1;
      item.style.transform = "translateX(-50%) scale(1)";
    } else if (i === (indexCoverflow - 1 + items.length) % items.length) {
      item.classList.add("prev");
      item.style.opacity = 0.5;
      item.style.transform = `translateX(calc(-50% - ${offset}px)) scale(0.8)`;
    } else if (i === (indexCoverflow + 1) % items.length) {
      item.classList.add("next");
      item.style.opacity = 0.5;
      item.style.transform = `translateX(calc(-50% + ${offset}px)) scale(0.8)`;
    }
  });

  const indicators = document.querySelectorAll("#carouselDestacados .carousel-indicators button");
  indicators.forEach((btn, i) => btn.classList.toggle("active", i === indexCoverflow));
}


// --- Capitalize ---
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// --- Inicialización SPA ---
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const productos = await obtenerProductos();
    window.productosGlobales = productos;
    router(); // renderiza la página actual y llama initPageFeatures
  } catch (err) {
    console.error("Error al obtener productos desde Airtable:", err);
  }
});
