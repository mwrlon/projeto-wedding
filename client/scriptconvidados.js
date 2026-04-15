const burgermenu = document.querySelector("#burgermenu");
const navlinks = document.querySelector("#navlinks");

burgermenu.addEventListener("click", () => {
    navlinks.classList.toggle("opacity-100");
});