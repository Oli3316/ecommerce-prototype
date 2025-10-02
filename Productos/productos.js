// Token y base
const API_KEY = "patT7TBAAgZsmibHM.e5a4d8f4ed88a551fe7cab0b63d524f3e1382687766b2dc6daf62c523fb551be";
const BASE_ID = "appjSiHXlFMyEwB5b";
const TABLE_NAME = "Products";

const contenedor = document.getElementById("productos-container");
const selectCategoria = document.getElementById("filtroCategoria");

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

// Función para renderizar productos en el DOM
function renderProductos(productos) {
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
            <p class="fw-bold">$${producto.fields.Precio}</p>
            <a href="#" class="btn btn-primary w-100">Agregar al carrito</a>
          </div>
        </div>
      </div>
    `;

    contenedor.appendChild(col);
  });
}

// Función para poblar el select de categorías
function cargarCategorias(productos) {
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
}

// Filtrar productos según categoría seleccionada
function filtrarProductos(productos, categoria) {
  if (categoria === "todas") return productos;
  return productos.filter(p => p.fields.Categoria && p.fields.Categoria.toLowerCase() === categoria);
}

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const productos = await obtenerProductos();

    // Cargar categorías en el select
    cargarCategorias(productos);

    // Render inicial
    renderProductos(productos);

    // Escuchar cambios en el filtro
    selectCategoria.addEventListener("change", () => {
      const categoria = selectCategoria.value;
      const productosFiltrados = filtrarProductos(productos, categoria);
      renderProductos(productosFiltrados);
    });

  } catch (error) {
    console.error("Error al obtener productos desde Airtable:", error);
  }
});
