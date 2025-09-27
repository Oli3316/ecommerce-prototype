const links = document.querySelectorAll("nav.navbar .nav-link");
const sections = document.querySelectorAll("main section");

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);

    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(targetId).classList.add("active");

    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});

(function(){
  emailjs.init("SiJdhKM8cxQrVxJ7H"); 
})();

document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector("form");
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    emailjs.sendForm('service_1102u5y', 'template_7qigike', this)
      .then(() => {
        form.reset();
        showToast("✅ Mensaje enviado correctamente");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);

      }, (err) => {
        console.error("Error al enviar el mensaje:", err);
        showToast("❌ Error al enviar el mensaje", true);
      });
  });
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

const API_KEY = "patT7TBAAgZsmibHM.e5a4d8f4ed88a551fe7cab0b63d524f3e1382687766b2dc6daf62c523fb551be";
const BASE_ID = "appjSiHXlFMyEwB5b";
const TABLE_NAME = "Products";

const contenedor = document.getElementById("productos-container");
let productosGlobal = [];

function obtenerURLImagen(imagen) {
  if (typeof imagen === "string" && imagen.startsWith("http")) return imagen.trim();
  if (Array.isArray(imagen) && imagen.length > 0 && imagen[0].url) return imagen[0].url;
  return "https://via.placeholder.com/300x200";
}

async function obtenerProductos() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  const data = await response.json();
  if (!data.records) throw new Error(`No se encontraron records. Revisa BASE_ID o TABLE_NAME.`);
  return data.records;
}

const categoriaMap = {
  calzas: "Pantalones",
  joggins: "Pantalones",
  shorts: "Pantalones",
  remeras: "Remeras",
  musculosas: "Remeras",
  buzos: "Abrigos",
  accesorios: "Accesorios",
  zapatillas: "Calzado"
};

function renderProductos(productos) {
  contenedor.innerHTML = "";
  productos.forEach(producto => {
    const imagenURL = obtenerURLImagen(producto.fields.Imagen);

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
      <div class="card shadow-sm h-100 product-card" data-nombre="${producto.fields.Nombre}" data-descripcion="${producto.fields.Descripcion || ''}" data-precio="${producto.fields.Precio}" data-imagen="${imagenURL}">
        <img src="${imagenURL}" class="card-img-top" alt="${producto.fields.Nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${producto.fields.Nombre}</h5>
          <p class="card-text">${producto.fields.Descripcion || ""}</p>
          <div class="mt-auto">
            <p class="fw-bold">$${producto.fields.Precio}</p>
            <a href="#" class="btn btn-primary w-100">Agregar al carrito</a>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(col);
  });

  activarModalProductos();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const productos = await obtenerProductos();
    productosGlobal = productos;
    renderProductos(productosGlobal);
    renderSlider(productosGlobal);
    activarBuscador();
    activarCategorias();
  } catch (error) {
    console.error(error);
  }
});

function activarBuscador() {
  const buscador = document.getElementById("buscador");
  buscador.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase().trim();

    let filtrados = productosGlobal.filter(p => (p.fields.Nombre || "").toLowerCase().includes(texto));

    const categoriaActiva = document.querySelector(".categories .nav-link.active")?.getAttribute("data-categoria");
    if (categoriaActiva && categoriaActiva !== "Todos") {
      filtrados = filtrados.filter(p => {
        const cat = categoriaMap[(p.fields.Categoria || "").toLowerCase()] || p.fields.Categoria;
        return cat === categoriaActiva;
      });
    }

    renderProductos(filtrados);
  });
}

function activarCategorias() {
  const categoriaLinks = document.querySelectorAll(".categories .nav-link");

  categoriaLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      const categoriaActiva = link.getAttribute("data-categoria");

      let filtrados = productosGlobal.filter(p => {
        const cat = categoriaMap[(p.fields.Categoria || "").toLowerCase()] || p.fields.Categoria;
        return categoriaActiva === "Todos" || cat === categoriaActiva;
      });

      const textoBuscador = document.getElementById("buscador").value.toLowerCase().trim();
      if (textoBuscador) {
        filtrados = filtrados.filter(p => (p.fields.Nombre || "").toLowerCase().includes(textoBuscador));
      }

      renderProductos(filtrados);

      categoriaLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

function activarModalProductos() {
  const productCards = document.querySelectorAll(".product-card");
  const modal = new bootstrap.Modal(document.getElementById("productoModal"));
  const modalTitle = document.getElementById("productoModalLabel");
  const modalImagen = document.getElementById("modalImagen");
  const modalDescripcion = document.getElementById("modalDescripcion");
  const modalPrecio = document.getElementById("modalPrecio");

  productCards.forEach(card => {
    card.addEventListener("click", e => {
      const nombre = card.getAttribute("data-nombre");
      const descripcion = card.getAttribute("data-descripcion");
      const precio = card.getAttribute("data-precio");
      const imagen = card.getAttribute("data-imagen");

      modalTitle.textContent = nombre;
      modalDescripcion.textContent = descripcion;
      modalPrecio.textContent = `$${precio}`;
      modalImagen.src = imagen;
      modalImagen.alt = nombre;

      modal.show();
    });
  });
}



const sliderContainer = document.getElementById("slider-container");


function renderSlider(productos) {
  sliderContainer.querySelectorAll('.card').forEach(c => c.remove()); 

  const destacados = productos.filter(p => p.fields.Destacados === true);

  destacados.forEach((producto, i) => {
    const imagenURL = obtenerURLImagen(producto.fields.Imagen);

    const card = document.createElement("div");
    card.className = "card shadow-sm h-100 product-card"; 
    if (i === 0) card.classList.add("active");
    else if (i === 1) card.classList.add("next");
    else if (i === destacados.length - 1) card.classList.add("prev");
    else card.classList.add("inactive");

    card.setAttribute("data-nombre", producto.fields.Nombre);
    card.setAttribute("data-descripcion", producto.fields.Descripcion || "");
    card.setAttribute("data-precio", producto.fields.Precio);
    card.setAttribute("data-imagen", imagenURL);

    card.innerHTML = `
      <img src="${imagenURL}" class="card-img-top" alt="${producto.fields.Nombre}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${producto.fields.Nombre}</h5>
        <p class="card-text">${producto.fields.Descripcion || ""}</p>
        <div class="mt-auto">
          <p class="fw-bold">$${producto.fields.Precio}</p>
          <a href="#" class="btn btn-primary w-100">Agregar al carrito</a>
        </div>
      </div>
    `;

    sliderContainer.insertBefore(card, sliderContainer.querySelector(".controls"));
  });

  activarModalProductos(); 
  initSlider();           
}


function initSlider() {
  const cards = sliderContainer.querySelectorAll('.card');
  let current = 0;

  function updateCards() {
    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'inactive');
      if (i === current) card.classList.add('active');
      else if (i === (current - 1 + cards.length) % cards.length) card.classList.add('prev');
      else if (i === (current + 1) % cards.length) card.classList.add('next');
      else card.classList.add('inactive');
    });
  }

  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % cards.length;
    updateCards();
  });

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + cards.length) % cards.length;
    updateCards();
  });

  updateCards();
}
