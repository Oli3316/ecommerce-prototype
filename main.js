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