const app = document.getElementById("app");
const links = document.querySelectorAll(".nav-link");
const loadedModals = {};

const API_KEY = "patT7TBAAgZsmibHM.e5a4d8f4ed88a551fe7cab0b63d524f3e1382687766b2dc6daf62c523fb551be";
const BASE_ID = "appjSiHXlFMyEwB5b";
const TABLE_NAME = "Products";

const contenedor = document.getElementById("productos-container");
const selectCategoria = document.getElementById("filtroCategoria");

 (function(){ emailjs.init("SiJdhKM8cxQrVxJ7H"); })();


async function loadPage(page) {
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error("No se pudo cargar la página");
    const html = await res.text();
    app.innerHTML = html;

    const sec = app.querySelector("section");
    if (sec) sec.classList.add("active");

    // 🚀 si estamos en la página de productos
    if (page === "productos") {
      const contenedor = document.getElementById("productos-container");
      const selectCategoria = document.getElementById("filtroCategoria");

      // Obtener productos desde Airtable (si no están en cache)
      if (!window.productosGlobales) {
        window.productosGlobales = await obtenerProductos();
      }

      // Render inicial con TODOS los productos
      renderProductos(window.productosGlobales, contenedor);

      // Poblar categorías
      if (selectCategoria) {
        cargarCategorias(window.productosGlobales, selectCategoria);

        // Listener para filtrar
        selectCategoria.addEventListener("change", () => {
          const categoria = selectCategoria.value;
          const productosFiltrados = filtrarProductos(window.productosGlobales, categoria);
          renderProductos(productosFiltrados, contenedor);
        });
      }
    }
    
    // 🚀 si estamos en la página de contacto
    if (page === "contacto") {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      emailjs.sendForm('service_1102u5y', 'template_7qigike', this)
        .then(() => {
          form.reset();
          showToast("✅ Mensaje enviado correctamente");
          setTimeout(() => {
            window.location.hash = "#inicio"; 
          }, 2000);

        }, (err) => {
          console.error("Error al enviar el mensaje:", err);
          showToast("❌ Error al enviar el mensaje", true);
        });
    });
  }
}
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
        showModal("exito", { text: "Producto agregado al carrito correctamente" });
      }
    });
  }

    // if (e.target && e.target.id === "btn-remove") {
    // e.preventDefault();
    // }
});



function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.innerHTML = message;
  
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.backgroundColor = "#ffffff"; 
  toast.style.color = "#000000";           
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
  toast.style.zIndex = "9999";
  toast.style.fontWeight = "bold";
  toast.style.fontSize = "14px";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);


  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

 
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}



// Token y base


// Función para obtener URL de imagen
function obtenerURLImagen(imagen) {
  if (typeof imagen === "string") return imagen.trim();
  if (Array.isArray(imagen) && imagen.length > 0 && imagen[0].url) return imagen[0].url;
  return ""; // Si no hay imagen, devolvemos vacío
}

// Función para obtener productos desde Airtable
async function obtenerProductos() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  console.log("Fetching desde:", url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });

  const data = await response.json();
  console.log("Respuesta de Airtable:", data);

  if (!data.records) {
    throw new Error(`No se encontraron records. Revisa BASE_ID (${BASE_ID}) o TABLE_NAME (${TABLE_NAME}).`);
  }

  return data.records;
}

// Función para formatear precios con punto de miles
function formatearPrecio(num) {
  if (!num) return "$0";
  return "$" + Number(num).toLocaleString("de-DE");
}

// Función para renderizar productos en el DOM
function renderProductos(productos, contenedor) {
  contenedor.innerHTML = ""; // Limpiar contenedor

  productos.forEach(producto => {
    const imagenURL = obtenerURLImagen(producto.fields.Imagen) || "https://via.placeholder.com/300x200";

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${imagenURL}" class="card-img-top" alt="${producto.fields.Nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${producto.fields.Nombre}</h5>
          <p class="card-text">${producto.fields.Descripcion || ""}</p>
          <div class="mt-auto">
            <p class="fw-bold">${formatearPrecio(producto.fields.Precio)}</p>
            <a href="#" class="btn btn-primary w-100 btn-detalle">Ver detalle</a>
          </div>
        </div>
      </div>
    `;

    // Botón Detalle
    const btnDetalle = col.querySelector(".btn-detalle");
    btnDetalle.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarDetalleProducto(producto);
    });

    contenedor.appendChild(col);
  });
}

// Función para poblar el select de categorías
function cargarCategorias(productos, selectCategoria) {
  selectCategoria.innerHTML = ""; // limpiar antes de poblar

  // Agregar opción por defecto: TODAS
  const optionTodas = document.createElement("option");
  optionTodas.value = "todas";
  optionTodas.textContent = "Todas";
  selectCategoria.appendChild(optionTodas);

  // Agregar categorías reales
  const categorias = new Set();
  productos.forEach(p => {
    if (p.fields.Categoria) categorias.add(p.fields.Categoria.toLowerCase());
  });

  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    selectCategoria.appendChild(option);
  });

  // Dejar seleccionado "todas" al inicio
  selectCategoria.value = "todas";
}

// Filtrar productos según categoría seleccionada
function filtrarProductos(productos, categoria) {
  if (categoria === "todas") return productos;
  return productos.filter(p => p.fields.Categoria && p.fields.Categoria.toLowerCase() === categoria);
}

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Obtener productos y guardarlos globalmente
    const productos = await obtenerProductos();
    window.productosGlobales = productos;

    // Render inicial (solo si existe el contenedor)
    const contenedor = document.getElementById("productos-container");
    if (contenedor) renderProductos(productos, contenedor);

    // Si el select existe, cargar categorías y agregar listener
    const selectCategoria = document.getElementById("filtroCategoria");
    if (selectCategoria) {
      cargarCategorias(productos, selectCategoria);
      selectCategoria.addEventListener("change", () => {
        const categoria = selectCategoria.value;
        const productosFiltrados = filtrarProductos(productos, categoria);
        renderProductos(productosFiltrados, contenedor);
      });
    }

    // Formulario
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        emailjs.sendForm('service_1102u5y', 'template_7qigike', this)
          .then(() => {
            form.reset();
            showToast("✅ Mensaje enviado correctamente");
            setTimeout(() => {
              window.location.href = "/Productos/productos.html";
            }, 2000);
          }, (err) => {
            console.error("Error al enviar el mensaje:", err);
            showToast("❌ Error al enviar el mensaje", true);
          });
      });
    }

  } catch (error) {
    console.error("Error al obtener productos desde Airtable:", error);
  }
});


// FUNCION MODAL (DETALLE PRODUCTO)
async function mostrarDetalleProducto(producto) {
  // Cargar modal si no está
  if (!loadedModals["detalleProducto"]) {
    const res = await fetch("modales/detalleProducto.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);
    loadedModals["detalleProducto"] = true;
  }

  // Llenar datos del producto
  document.getElementById("detalleNombre").textContent = producto.fields.Nombre;
  document.getElementById("detalleDescripcion").textContent = producto.fields.Descripcion || "";
  document.getElementById("detallePrecio").textContent = formatearPrecio(producto.fields.Precio);
  document.getElementById("detalleImagen").src = obtenerURLImagen(producto.fields.Imagen) || "https://via.placeholder.com/300x200";

  // Botón agregar al carrito
  const btn = document.getElementById("btnAgregarCarritoDetalle");
  btn.replaceWith(btn.cloneNode(true)); // remover listeners anteriores
  document.getElementById("btnAgregarCarritoDetalle").addEventListener("click", () => {
    const metodoPago = document.getElementById("metodoPago").value;
    showModal("confirmar", {
      text: `¿Deseas agregar este producto al carrito con pago: ${metodoPago}?`,
      onConfirm: () => {
        showModal("exito", { text: "Producto agregado al carrito correctamente" });
      }
    });
  });

  // Mostrar modal
  const modalEl = document.getElementById("modalDetalleProducto");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}