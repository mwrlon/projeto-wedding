// MENU MOBILE
const burgermenu = document.querySelector("#burgermenu");
const navlinks = document.querySelector("#navlinks");

burgermenu.addEventListener("click", () => {
    navlinks.classList.toggle("hidden");
    navlinks.classList.toggle("opacity-100");
});

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

const apiUrl = 'http://localhost:3000/api/dashboard';
const apiUrlCheckin = 'http://localhost:3000/api/checkin'

const atualizarNumeros = (total, confirmados, pendentes) => {
    document.getElementById("registrados").innerText = total || 0;
    document.getElementById("confirmados").innerText = confirmados || 0;
    document.getElementById("pendentes").innerText = pendentes || 0;
};

// Função principal que carrega tudo
const carregarDadosDashboard = async () => {
  try {
    // Carrega os números dos cards
    const resDash = await fetch(apiUrl);
    const dados = await resDash.json();
    atualizarNumeros(dados.total, dados.confirmados, dados.pendentes);

    // Carrega a lista de quem já fez check-in
    const resCheck = await fetch(apiUrlCheckin);
    const todosConvidados = await resCheck.json();
    
    // Só mostramos na lista do Dashboard quem está 'confirmado'
    const apenasConfirmados = todosConvidados.filter(c => c.status === 'confirmado');
    adicionarCheckins(apenasConfirmados);

  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
};

// Função que renderiza o HTML na lista de check-ins
const adicionarCheckins = (lista) => {
  const container = document.getElementById("listaCheckins");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p class='text-gray-500 italic'>Nenhum check-in realizado ainda.</p>";
    return;
  }

  // Pegamos apenas os últimos 5 para não esticar demais a página
  const ultimosCinco = lista.reverse().slice(0, 5);

  ultimosCinco.forEach((pessoa) => {
    container.innerHTML += `
      <div class="flex justify-between py-3 border-b border-gray-100 last:border-0">
        <div>
          <p class="font-medium text-gray-800">${pessoa.nome}</p>
          <p class="text-xs text-emerald-600 font-medium">Check-in realizado ✅</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-400">Mesa</p>
          <p class="font-bold text-amber-700">${pessoa.mesa}</p>
        </div>
      </div>
    `;
  });
};

// Iniciar
carregarDadosDashboard();
