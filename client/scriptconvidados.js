const burgermenu = document.querySelector("#burgermenu");
const navlinks = document.querySelector("#navlinks");
const logoutButtons = document.querySelectorAll("#logoutButton");
const fechar = document.querySelector("#fechar");
const popupCadastro = document.querySelector("#popupCadastro");
const background = document.querySelector("#background");

burgermenu.addEventListener("click", () => {
    navlinks.classList.toggle("hidden");
    navlinks.classList.toggle("opacity-100");
});

logoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    let confirmar = confirm("Tem certeza de que deseja sair?");
    
    if (!confirmar) {
      alert("Logout cancelado.");
    } else {
      window.location.href = "login.html";
    }
  });
});

const cadastrarNovo = () => {
    popupCadastro.classList.remove("hidden");
      background.classList.add("blur-sm");
      background.classList.add("pointer-events-none");
      header.classList.add("blur-sm");
      header.classList.add("pointer-events-none");

};

fechar.addEventListener("click", () => {
    popupCadastro.classList.toggle("hidden");
    background.classList.remove("blur-sm");
    background.classList.remove("pointer-events-none");
    header.classList.remove("blur-sm");
    header.classList.remove("pointer-events-none");
});
