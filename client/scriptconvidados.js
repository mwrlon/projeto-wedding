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

// =====================
// CONVIDADOS
// =====================

let lista = document.getElementById("listaConvidados");
let busca = document.getElementById("busca");

let convidados = [
  { nome: "João", cpf: "123", email: "joao@email.com", mesa: 1 },
  { nome: "Maria", cpf: "456", email: "maria@email.com", mesa: 2 }
];

// MOSTRAR CONVIDADOS
function mostrar(listaConvidados = convidados) {
  lista.innerHTML = "";

  listaConvidados.forEach((c) => {
    lista.innerHTML += `
      <div class="card">
        <h2>${c.nome}</h2>
        <p>CPF: ${c.cpf}</p>
        <p>Mesa: ${c.mesa}</p>
      </div>
    `;
  });

  document.getElementById("registrados").innerText = convidados.length;
}

// CADASTRAR
function cadastrarUsuario() {
  let nome = document.getElementById("name").value;
  let cpf = document.getElementById("cpf").value;
  let email = document.getElementById("email").value;
  let mesa = document.getElementById("mesa").value;

  if (!nome || !cpf || !email || !mesa) {
    alert("Preencha tudo");
    return;
  }

  convidados.push({ nome, cpf, email, mesa });

  mostrar();

  popup.classList.add("hidden");
  background.classList.remove("blur-sm");
  header.classList.remove("blur-sm");
}

// BUSCA
busca.oninput = () => {
  let valor = busca.value.toLowerCase();

  let filtrados = convidados.filter((c) =>
    c.nome.toLowerCase().includes(valor)
  );

  mostrar(filtrados);
};

// INICIAR
mostrar();