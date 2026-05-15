// MENU
const burgermenu = document.getElementById("burgermenu");
const navlinks = document.querySelector("#navlinks");

burgermenu.addEventListener("click", () => {
    navlinks.classList.toggle("hidden");
    navlinks.classList.toggle("opacity-100");
});

// LOGOUT
document.querySelectorAll("#logoutButton").forEach((botao) => {
  botao.onclick = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "login.html";
    }
  };
});
// POPUP

let popup = document.getElementById("popupCadastro");
let background = document.getElementById("background");
let header = document.getElementById("header");

function cadastrarNovo() {
  popup.classList.remove("hidden");
  background.classList.add("blur-sm");
  header.classList.add("blur-sm");
}

document.getElementById("fechar").onclick = () => {
  popup.classList.add("hidden");
  background.classList.remove("blur-sm");
  header.classList.remove("blur-sm");
};

// MOSTRAR CONVIDADOS

const apiUrl = 'http://localhost:3000/api/guests';
const listaContainer = document.getElementById("lista");

async function carregarConvidados() {
  try {
    const response = await fetch(apiUrl);
    // 2. Salve os dados vindos da API na variável global
    todosOsConvidados = await response.json(); 
    mostrar(todosOsConvidados);
  } catch (error) {
    console.error("Erro ao carregar:", error);
    listaContainer.innerHTML = "<p>Erro ao carregar convidados.</p>";
  }
}

const mostrar = (convidados) => {
  listaContainer.innerHTML = "";
  
  let htmlGerado = "";

  convidados.forEach((c) => {
    htmlGerado += `
    <div class="card-item">
      <div class="bg-[#fffbf7] rounded-2xl p-4 border border-black/20">
        <div class="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <p class="text-lg font-semibold">${c.nome}</p>
            <p class="text-sm text-gray-600">
              Mesa <span>${c.mesa}</span> |
              <span>${c.cpf}</span>
            </p>
          </div>

          <div class="flex gap-4 text-xl sm:items-start items-center">
            <button onclick="excluirConvidado(${c.id})" class="cursor-pointer hover:scale-110 transition">
                <img src="/client/src/files/excluir.png" alt="Botão Excluir" class="w-6 h-auto">
            </button>
          </div>
        </div>
      </div>
    </div>
    `;
  });

  listaContainer.innerHTML = htmlGerado;

  // Atualiza o contador lá em cima no seu HTML
  document.getElementById("registrados").innerText = convidados.length;
}

// Chama a função ao abrir a página
carregarConvidados();

// CADASTRAR
const cadastrarUsuario = async () => {
  let nome = document.getElementById("name").value;
  let cpf = document.getElementById("cpf").value;
  let email = document.getElementById("email").value;
  let mesa = document.getElementById("mesa").value;

  if (!nome || !cpf || !email || !mesa) {
    alert("Preencha tudo");
    return;
  }

  // Criamos o objeto com os dados
  const novoConvidado = { nome, cpf, email, mesa };

  try {
    // Usamos 'await' para esperar o servidor responder
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoConvidado)
    });
      if (response.ok) {
        alert("Convidado cadastrado com sucesso!");
        
        // Limpa os campos do formulário
        document.getElementById("name").value = "";
        document.getElementById("cpf").value = "";
        document.getElementById("email").value = "";
        document.getElementById("mesa").value = "";

        carregarConvidados(); // Atualiza a lista na tela
        fecharPopup();        // Fecha o modal
      } else {
        const erro = await response.json();
        alert("Erro ao cadastrar: " + (erro.error || "Erro desconhecido"));
      }
    } catch (error) {
        document.getElementById("name").value = "";
        document.getElementById("cpf").value = "";
        document.getElementById("email").value = "";
        document.getElementById("mesa").value = "";
      }
    };

  popup.classList.add("hidden");
  background.classList.remove("blur-sm");
  header.classList.remove("blur-sm");


// BUSCA

const campoBusca = document.getElementById("busca");

campoBusca.oninput = () => {
  const valor = campoBusca.value.toLowerCase();

  // Filtramos em cima da lista global 'todosOsConvidados'
  const filtrados = todosOsConvidados.filter((c) =>
    c.nome.toLowerCase().includes(valor) ||
    c.cpf.includes(valor) // Dica: agora busca por nome ou CPF!
  );

  mostrar(filtrados);
};

const excluirConvidado = async (id) => {
  if (confirm("Tem certeza?")) {
    try {
      console.log("ID que será enviado:", id); 

      const response = await fetch(`http://localhost:3000/api/guests/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Excluído!");
        carregarConvidados();
      } else {
        const erro = await response.json();
        alert("Erro: " + erro.error);
      }
    } catch (error) {
      alert("Erro na conexão: " + error.message);
    }
  }
};

