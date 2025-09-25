const links = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section");

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);

    // ocultar todas
    sections.forEach(sec => sec.classList.remove("active"));

    // mostrar la elegida
    document.getElementById(targetId).classList.add("active");

    // actualizar link activo
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

// Token y base
const API_KEY = "patT7TBAAgZsmibHM.e5a4d8f4ed88a551fe7cab0b63d524f3e1382687766b2dc6daf62c523fb551be";
const BASE_ID = "appjSiHXlFMyEwB5b";
const TABLE_NAME = "Products";

const contenedor = document.getElementById("productos-container");

// Función para obtener URL de imagen
function obtenerURLImagen(imagen) {
  if (typeof imagen === "string") return imagen.trim();
  if (Array.isArray(imagen) && imagen.length > 0 && imagen[0].url) return imagen[0].url;
  return ""; // Si no hay imagen, devolvemos vacío
}

// Función para obtener productos desde Airtable
async function obtenerProductos() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const data = await response.json();
  return data.records;
}

// Función para renderizar productos en el DOM
function renderProductos(productos) {
  contenedor.innerHTML = ""; // Limpiar contenedor

  productos.forEach(producto => {
    const imagenURL = obtenerURLImagen(producto.fields.Image) || "https://via.placeholder.com/300x200";

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${imagenURL}" class="card-img-top" alt="${producto.fields.Name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${producto.fields.Name}</h5>
          <p class="card-text">${producto.fields.Description || ""}</p>
          <div class="mt-auto">
            <p class="fw-bold">$${producto.fields.Price}</p>
            <a href="#" class="btn btn-primary w-100">Agregar al carrito</a>
          </div>
        </div>
      </div>
    `;

    contenedor.appendChild(col);
  });
}

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const productos = await obtenerProductos();
    renderProductos(productos);
  } catch (error) {
    console.error("Error al obtener productos desde Airtable:", error);
  }
});

async function obtenerProductos() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  console.log("📡 Fetching desde:", url); // LOG

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });

  const data = await response.json();
  console.log("🔎 Respuesta de Airtable:", data); // LOG

  if (!data.records) {
    throw new Error(`No se encontraron records. Revisa BASE_ID (${BASE_ID}) o TABLE_NAME (${TABLE_NAME}).`);
  }

  return data.records;
}