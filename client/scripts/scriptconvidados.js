requireAuth();

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
      logout();
    }
  };
});
// POPUP

let popup = document.getElementById("popupCadastro");
let background = document.getElementById("background");
let header = document.getElementById("header");

const tituloPopup = document.getElementById("tituloPopup");
const botaoSalvar = document.getElementById("botaoSalvar");
const camposForm = ["name", "cpf", "email", "mesa"];

// ID do convidado sendo editado (null = cadastrando um novo)
let convidadoEmEdicao = null;

const limparFormulario = () => {
  camposForm.forEach((campo) => {
    document.getElementById(campo).value = "";
  });
};

function abrirPopup() {
  popup.classList.remove("hidden");
  background.classList.add("blur-sm");
  header.classList.add("blur-sm");
}

function fecharPopup() {
  popup.classList.add("hidden");
  background.classList.remove("blur-sm");
  header.classList.remove("blur-sm");
}

function cadastrarNovo() {
  convidadoEmEdicao = null;
  limparFormulario();
  tituloPopup.textContent = "Novo Convidado";
  botaoSalvar.textContent = "Cadastrar";
  abrirPopup();
}

function editarConvidado(id) {
  const convidado = todosOsConvidados.find((c) => c.id === id);
  if (!convidado) return;

  convidadoEmEdicao = id;
  document.getElementById("name").value = convidado.nome;
  document.getElementById("cpf").value = convidado.cpf;
  document.getElementById("email").value = convidado.email;
  document.getElementById("mesa").value = convidado.mesa;
  tituloPopup.textContent = "Editar Convidado";
  botaoSalvar.textContent = "Salvar";
  abrirPopup();
}

document.getElementById("fechar").onclick = () => {
  convidadoEmEdicao = null;
  fecharPopup();
};

// MOSTRAR CONVIDADOS

const apiUrl = '/guests';
let todosOsConvidados = [];
const listaContainer = document.getElementById("lista");

async function carregarConvidados() {
  try {
    const response = await authFetch(apiUrl);
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
            <p class="text-lg font-semibold">${escapeHtml(c.nome)}</p>
            <p class="text-sm text-gray-600">
              Mesa <span>${escapeHtml(c.mesa)}</span> |
              <span>${escapeHtml(c.cpf)}</span>
            </p>
          </div>

          <div class="flex gap-4 text-xl sm:items-start items-center">
            <button onclick="editarConvidado(${Number(c.id)})" class="cursor-pointer hover:scale-110 transition">
                <img src="/client/src/files/editar.png" alt="Botão Editar" class="w-6 h-auto">
            </button>
            <button onclick="excluirConvidado(${Number(c.id)})" class="cursor-pointer hover:scale-110 transition">
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

// CADASTRAR / EDITAR
const salvarConvidado = async () => {
  const nome = document.getElementById("name").value;
  const cpf = document.getElementById("cpf").value;
  const email = document.getElementById("email").value;
  const mesa = document.getElementById("mesa").value;

  if (!nome || !cpf || !email || !mesa) {
    alert("Preencha tudo");
    return;
  }

  const dados = { nome, cpf, email, mesa };
  const editando = convidadoEmEdicao !== null;

  try {
    const response = await authFetch(editando ? `${apiUrl}/${convidadoEmEdicao}` : apiUrl, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      alert(editando ? "Convidado atualizado com sucesso!" : "Convidado cadastrado com sucesso!");

      convidadoEmEdicao = null;
      limparFormulario();
      carregarConvidados(); // Atualiza a lista na tela
      fecharPopup();        // Fecha o modal
    } else {
      const erro = await response.json();
      alert((editando ? "Erro ao atualizar: " : "Erro ao cadastrar: ") + (erro.error || "Erro desconhecido"));
    }
  } catch (error) {
    alert("Erro na conexão: " + error.message);
  }
};

fecharPopup();


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

      const response = await authFetch(`/guests/${id}`, {
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

