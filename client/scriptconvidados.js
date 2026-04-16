const burgermenu = document.querySelector("#burgermenu");
const navlinks = document.querySelector("#navlinks");

burgermenu.addEventListener("click", () => {
    navlinks.classList.toggle("hidden");
    navlinks.classList.toggle("opacity-100");
});

const logoutButtons = document.querySelectorAll("#logoutButton");

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
}