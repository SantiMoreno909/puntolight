const nav = document.querySelector("#navbar");
const abrir = document.querySelector("#abrirNavbar-btn");
const cerrar = document.querySelector("#cerrarNavbar-btn");

abrir.addEventListener("click", () => {
  nav.classList.add("nav-visible");
});

cerrar.addEventListener("click", () => {
  nav.classList.remove("nav-visible");
});

// Agregar evento para cerrar el menú al hacer clic fuera del botón o del menú
document.addEventListener("mousedown", (event) => {
  const target = event.target;

  // Verificar si el clic no ocurrió dentro del área del menú y no fue en el botón de abrir
  if (!nav.contains(target) && target !== abrir) {
    nav.classList.remove("nav-visible");
  }
});
