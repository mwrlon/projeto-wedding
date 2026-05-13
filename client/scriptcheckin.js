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
        if (confirm("Tem certeza de que deseja sair?")) {
            window.location.href = "login.html";
        }
    };
});

// CHECK-IN
const lista = document.getElementById("listaBusca");
const template = document.getElementById("cardBusca");
const busca = document.getElementById("busca");

const apiUrl = 'http://localhost:3000/api/guests';
let convidados = []; // Começa vazio e será preenchido pela API

// --- NOVO: Função para buscar convidados do Banco de Dados ---
async function carregarConvidados() {
    try {
        const response = await fetch(apiUrl);
        convidados = await response.json();
        console.log("Dados carregados:", convidados);
    } catch (error) {
        console.error("Erro ao carregar convidados:", error);
    }
}

const mostrarConvidados = (listaConvidados) => {
  lista.innerHTML = "";

  listaConvidados.forEach((nomePessoa) => {
    let clone = template.content.cloneNode(true);

    const nomeTxt = clone.querySelector("#nomePessoa");
    const mesaTxt = clone.querySelector("#mesa");
    const btnCheckin = clone.querySelector("button");

    nomeTxt.innerText = nomePessoa.nome;
    mesaTxt.innerText = nomePessoa.mesa;

    // Se o status no banco já for 'confirmado', desativamos o botão
    if (nomePessoa.status === 'confirmado') {
        btnCheckin.innerText = "Confirmado ✅";
        btnCheckin.classList.replace("bg-[var(--color-quaternary-100)]", "bg-green-600");
        btnCheckin.disabled = true;
        btnCheckin.classList.remove("cursor-pointer");
    } else {
        // Se estiver pendente, adicionamos o evento de clique
        btnCheckin.onclick = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/guests/${nomePessoa.id}/checkin`, {
                    method: 'PATCH'
                });

                if (response.ok) {
                    alert(`Check-in de ${nomePessoa.nome} realizado!`);
                    carregarConvidados();
                } else {
                    alert("Erro ao realizar check-in.");
                }
            } catch (error) {
                console.error("Erro:", error);
            }
        };
    }

    lista.appendChild(clone);
  });
}

// PESQUISA
busca.oninput = () => {
    let valor = busca.value.toLowerCase();

    if (valor === "") {
        lista.innerHTML = "";
        return;
    }

    // Filtra por nome ou por CPF
    let filtrados = convidados.filter((pessoa) =>
        pessoa.nome.toLowerCase().includes(valor) || 
        (pessoa.cpf && pessoa.cpf.includes(valor))
    );

    mostrarConvidados(filtrados);
};

// Inicializa os dados assim que a página abre
carregarConvidados();