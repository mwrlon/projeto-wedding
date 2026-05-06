// MENU MOBILE
const burgermenu = document.querySelector("#burgermenu");
const navlinks = document.querySelector("#navlinks");

burgermenu.onclick = () => {
  navlinks.classList.toggle("hidden");
};

// LOGOUT
const logoutButtons = document.querySelectorAll("#logoutButton");

logoutButtons.forEach((btn) => {
  btn.onclick = () => {
    if (confirm("Deseja sair?")) {
      window.location.href = "login.html";
    }
  };
});

// ATUALIZA NÚMEROS
function atualizarNumeros(total, confirmados, pendentes) {
  document.getElementById("registrados").textContent = total;
  document.getElementById("confirmados").textContent = confirmados;
  document.getElementById("pendentes").textContent = pendentes;
}

// MOSTRA CHECK-INS
function adicionarCheckins(lista) {
  const container = document.getElementById("listaCheckins");

  container.innerHTML = "";

  lista.forEach((pessoa) => {
    container.innerHTML += `
      <div class="flex justify-between py-3 border-b">
        <div>
          <p class="font-medium">${pessoa.nome}</p>
          <p class="text-sm text-gray-500">Check-in realizado</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">Mesa</p>
          <p class="font-semibold">${pessoa.mesa}</p>
        </div>
      </div>
    `;
  });
}