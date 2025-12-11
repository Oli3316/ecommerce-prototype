const app = document.getElementById("app");
const links = document.querySelectorAll(".nav-link");
const loadedModals = {};

const API_KEY = "patT7TBAAgZsmibHM.e5a4d8f4ed88a551fe7cab0b63d524f3e1382687766b2dc6daf62c523fb551be";
const BASE_ID = "appjSiHXlFMyEwB5b";
const TABLE_NAME = "Products";

(function () { emailjs.init("SiJdhKM8cxQrVxJ7H"); })();

async function loadPage(page) {
  try {
    const res = await fetch(`pages/${page}.html`);
    if (!res.ok) throw new Error("No se pudo cargar la página");
    const html = await res.text();
    app.innerHTML = html;

    const sec = app.querySelector("section");
    if (sec) sec.classList.add("active");

    if (page === "inicio") {
      if (!window.productosGlobales) window.productosGlobales = await obtenerProductos();
      renderDestacados(window.productosGlobales);
    }

    if (page === "productos") {
      const contenedor = document.getElementById("productos-container");
      const selectCategoria = document.getElementById("filtroCategoria");
      const buscadorProductos = document.getElementById("buscadorProductos");

      if (!window.productosGlobales) window.productosGlobales = await obtenerProductos();

      renderProductos(window.productosGlobales, contenedor);

      if (selectCategoria) {
        cargarCategorias(window.productosGlobales, selectCategoria);

        selectCategoria.addEventListener("change", () => {
          filtrarYRenderizar();
        });
      }

      if (buscadorProductos) {
        buscadorProductos.addEventListener("input", () => {
          filtrarYRenderizar();
        });
      }

      function filtrarYRenderizar() {
        let productosFiltrados = window.productosGlobales;

        
        const categoria = selectCategoria.value;
        productosFiltrados = filtrarProductos(productosFiltrados, categoria);

       
        const textoBusqueda = buscadorProductos ? buscadorProductos.value.toLowerCase() : "";
        productosFiltrados = productosFiltrados.filter(p =>
          p.fields.Nombre.toLowerCase().includes(textoBusqueda)
        );

        renderProductos(productosFiltrados, contenedor);
      }
    }

    if (page === "contacto") {
      const form = document.querySelector("form");
      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          emailjs.sendForm('service_1102u5y', 'template_7qigike', this)
            .then(() => {
              form.reset();
              showToast("✅ Mensaje enviado correctamente");
              setTimeout(() => { window.location.hash = "#inicio"; }, 2000);
            }, (err) => {
              showToast("❌ Error al enviar el mensaje", true);
            });
        });
      }
    }

    if (page === "carrito") {
      const contenedorCarrito = document.getElementById("carrito-container");
      renderCarrito(contenedorCarrito);
    }

  } catch (err) {
    app.innerHTML = `<h1>Error 404</h1><p>Página no encontrada</p>`;
  }
}

async function showModal(name, options = {}) {
  try {
    if (!loadedModals[name]) {
      const res = await fetch(`modales/${name}.html`);
      if (!res.ok) throw new Error("No se pudo cargar el modal");
      const html = await res.text();
      document.body.insertAdjacentHTML("beforeend", html);
      loadedModals[name] = true;
    }

    const modalEl = document.getElementById(`modal${capitalize(name)}`);
    if (!modalEl) throw new Error("No se encontró el modal en el DOM");

    const modal = new bootstrap.Modal(modalEl);

    if (options.title) {
      const titleEl = modalEl.querySelector(".modal-title");
      if (titleEl) titleEl.textContent = options.title;
    }

    if (options.message) {
      const bodyEl = modalEl.querySelector(".modal-body");
      if (bodyEl) bodyEl.textContent = options.message;
    }

    if (options.onConfirm) {
      const btnConfirm = modalEl.querySelector("#confirmarAccion");
      if (btnConfirm) {
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

function router() {
  const hash = window.location.hash.substring(1) || "inicio";
  loadPage(hash);

  links.forEach(l => l.classList.remove("active"));
  const activeLink = document.querySelector(`.nav-link[href="#${hash}"]`);
  if (activeLink) activeLink.classList.add("active");
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

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
  requestAnimationFrame(() => { toast.style.opacity = "1"; });
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => { document.body.removeChild(toast); }, 300);
  }, 2000);
}

function obtenerURLImagen(imagen) {
  if (typeof imagen === "string") return imagen.trim();
  if (Array.isArray(imagen) && imagen.length > 0 && imagen[0].url) return imagen[0].url;
  return "";
}

async function obtenerProductos() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  const data = await response.json();
  if (!data.records) throw new Error(`No se encontraron records. Revisa BASE_ID (${BASE_ID}) o TABLE_NAME (${TABLE_NAME}).`);
  return data.records;
}

function formatearPrecio(num) {
  if (!num) return "$0";
  return "$" + Number(num).toLocaleString("de-DE");
}

function renderProductos(productos, contenedor) {
  contenedor.innerHTML = "";
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
    col.querySelector(".btn-detalle").addEventListener("click", (e) => {
      e.preventDefault();
      mostrarDetalleProducto(producto);
    });
    contenedor.appendChild(col);
  });
}

function cargarCategorias(productos, selectCategoria) {
  selectCategoria.innerHTML = "";
  const optionTodas = document.createElement("option");
  optionTodas.value = "todas";
  optionTodas.textContent = "Todas";
  selectCategoria.appendChild(optionTodas);

  const categorias = new Set();
  productos.forEach(p => { if (p.fields.Categoria) categorias.add(p.fields.Categoria.toLowerCase()); });
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    selectCategoria.appendChild(option);
  });
  selectCategoria.value = "todas";
}

function filtrarProductos(productos, categoria) {
  if (categoria === "todas") return productos;
  return productos.filter(p => p.fields.Categoria && p.fields.Categoria.toLowerCase() === categoria);
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    
    const productos = await obtenerProductos();
    window.productosGlobales = productos;

    
    const contenedor = document.getElementById("productos-container");
    if (contenedor) renderProductos(productos, contenedor);

    
    renderDestacados(productos);


    const selectCategoria = document.getElementById("filtroCategoria");
    if (selectCategoria) {
      cargarCategorias(productos, selectCategoria);
      selectCategoria.addEventListener("change", () => {
        const categoria = selectCategoria.value;
        const productosFiltrados = filtrarProductos(productos, categoria);
        renderProductos(productosFiltrados, contenedor);
      });
    }

    
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", function (e) {
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



async function mostrarDetalleProducto(producto) {
  
  if (!loadedModals["detalleProducto"]) {
    const res = await fetch("modales/detalleProducto.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);
    loadedModals["detalleProducto"] = true;
  }

  
  document.getElementById("detalleNombre").textContent = producto.fields.Nombre;
  document.getElementById("detalleDescripcion").textContent = producto.fields.Descripcion || "";
  document.getElementById("detallePrecio").textContent = formatearPrecio(producto.fields.Precio);
  document.getElementById("detalleImagen").src = obtenerURLImagen(producto.fields.Imagen) || "https://via.placeholder.com/300x200";

  const btn = document.getElementById("btnAgregarCarritoDetalle");
  btn.replaceWith(btn.cloneNode(true)); 
  document.getElementById("btnAgregarCarritoDetalle").addEventListener("click", () => {
    const metodoPago = document.getElementById("metodoPago").value;
    showModal("confirmar", {
      title: "Agregar producto",
      message: "Está seguro de agregar el producto al carrito?",
      onConfirm: () => {
        agregarAlCarrito(producto);
        showModal("exito", { title: "Genial", message: "Producto agregado al carrito correctamente." });
      }
    });
  });

  
  const modalEl = document.getElementById("modalDetalleProducto");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function renderDestacados(productos) {
  const destacadosContainer = document.getElementById("destacados-container");
  if (!destacadosContainer) return;

  
  const destacados = productos.filter(p => p.fields.Destacado === true);

  destacadosContainer.innerHTML = "";

  destacados.forEach(producto => {
    const imagenURL = obtenerURLImagen(producto.fields.Imagen) || "https://via.placeholder.com/300x200";

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

    col.innerHTML = `
    <div class="card shadow-sm h-100">
      <img src="${imagenURL}" class="card-img-top" alt="${producto.fields.Nombre}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title fw-bold">${producto.fields.Nombre}</h5>
        <p class="card-text">${producto.fields.Descripcion || ""}</p>
        <div class="mt-auto">
          <p class="fw-bold">${formatearPrecio(producto.fields.Precio)}</p>
          <a href="#" class="btn btn-primary w-100 btn-detalle">Ver detalle</a>
        </div>
      </div>
    </div>
  `;

    const btnDetalle = col.querySelector(".btn-detalle");
    btnDetalle.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarDetalleProducto(producto);
    });

    destacadosContainer.appendChild(col);
  });
}



function getCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}


function saveCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}


function agregarAlCarrito(producto) {
  let carrito = getCarrito();
  const id = producto.id;

  
  const item = carrito.find(p => p.id === id);

  if (item) {
    item.cantidad += 1; 
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.fields.Nombre,
      precio: producto.fields.Precio,
      imagen: obtenerURLImagen(producto.fields.Imagen),
      cantidad: 1
    });
  }

  saveCarrito(carrito);
  return carrito;
}


function actualizarCantidad(id, delta) {
  let carrito = getCarrito();
  const itemIndex = carrito.findIndex(p => p.id === id);

  if (itemIndex > -1) {
    carrito[itemIndex].cantidad += delta;

    if (carrito[itemIndex].cantidad <= 0) {
      carrito.splice(itemIndex, 1); 
    }
  }

  saveCarrito(carrito);
  return carrito;
}

function renderCarrito(contenedor) {
  const carrito = getCarrito();
  const footer = document.getElementById("carrito-footer");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center p-5">
        <h5>Tu carrito está vacío 😢</h5>
        <p>Agrega productos para verlos aquí.</p>
      </div>
    `;
   
    footer.style.display = "none";
    return;
  }

 
  footer.style.display = "block";

  carrito.forEach(item => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${item.imagen}" class="card-img-top" alt="${item.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${item.nombre}</h5>
          <p class="fw-bold">${formatearPrecio(item.precio)}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <button class="btn btn-outline-secondary btn-restar">-</button>
            <span class="mx-2 fw-bold">${item.cantidad}</span>
            <button class="btn btn-outline-secondary btn-sumar">+</button>
          </div>
        </div>
      </div>
    `;

    
    col.querySelector(".btn-sumar").addEventListener("click", () => {
      actualizarCantidad(item.id, +1);
      renderCarrito(contenedor);
    });

    col.querySelector(".btn-restar").addEventListener("click", () => {
      actualizarCantidad(item.id, -1);
      renderCarrito(contenedor);
    });

    contenedor.appendChild(col);
  });

  
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  document.getElementById("carrito-total").textContent = `$${total}`;

 
  const btnVaciar = document.getElementById("btnVaciarCarrito");
  if (btnVaciar) {
    btnVaciar.onclick = () => {
      localStorage.setItem("carrito", JSON.stringify([]));
      renderCarrito(contenedor);
    };
  }

  const btnFinalizar = document.getElementById("btnFinalizarPedido");
  if (btnFinalizar) {
    btnFinalizar.onclick = async () => {
      await showModal("finalizarPedido");

      const form = document.getElementById("formFinalizarPedido");
      const direccionGroup = document.getElementById("direccion-group");

      
      document.querySelectorAll("input[name='entrega']").forEach((radio) => {
        radio.addEventListener("change", (e) => {
          if (e.target.value === "envio") {
            direccionGroup.classList.remove("d-none");
            direccionGroup.querySelector("input").setAttribute("required", "true");
          } else {
            direccionGroup.classList.add("d-none");
            direccionGroup.querySelector("input").removeAttribute("required");
          }
        });
      });

      
      form.onsubmit = (e) => {
        e.preventDefault();

        const pedido = {
          nombre: document.getElementById("nombre").value,
          email: document.getElementById("email").value,
          telefono: document.getElementById("telefono").value,
          entrega: document.querySelector("input[name='entrega']:checked").value,
          direccion: document.getElementById("direccion").value || null,
          carrito: getCarrito()
        };

        showModal('exito', { title: 'Pedido finalizado', message: 'Su pedido fue confirmado, en breve recibira un mail con su información.' });

        
        localStorage.setItem("carrito", JSON.stringify([]));
        renderCarrito(document.getElementById("carrito-container"));

       
        const modalEl = document.getElementById("modalFinalizarPedido");
        bootstrap.Modal.getInstance(modalEl).hide();
      };
    };
  }

  document.addEventListener("click", (e) => {
  if (e.target.id === "btnFinalizarPedido") {
    const carrito = getCarrito();
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    alert(`Pedido finalizado! Total: $${total}`);
    localStorage.setItem("carrito", JSON.stringify([]));
    renderCarrito(document.getElementById("carrito-container"));
  }

  if (e.target.id === "btnVaciarCarrito") {
    localStorage.setItem("carrito", JSON.stringify([]));
    renderCarrito(document.getElementById("carrito-container"));
  }
});
}

