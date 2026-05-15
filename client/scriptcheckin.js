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

const lista = document.getElementById("listaBusca");
const busca = document.getElementById("busca");
const apiUrl = 'http://localhost:3000/api/guests';
let convidados = []; 

async function carregarConvidados() {
    try {
        const response = await fetch(apiUrl);
        convidados = await response.json();
    } catch (error) {
        console.error("Erro ao carregar convidados:", error);
    }
}

const mostrarConvidados = (listaFiltrada) => {
    lista.innerHTML = "";
    let htmlGerado = "";

    listaFiltrada.forEach((c) => {
        const isConfirmado = c.status === 'confirmado';
        
        const botaoHtml = isConfirmado 
            ? `<button class="px-4 py-2 rounded-lg bg-green-600 text-white font-medium" disabled>Confirmado ✅</button>`
            : `<button onclick="fazerCheckin(${c.id}, '${c.nome}')" class="px-4 py-2 rounded-lg bg-[var(--color-quaternary-100)] text-white cursor-pointer hover:scale-105 transition">Check-in</button>`;

        htmlGerado += `
        <div class="flex items-center justify-between w-full min-h-20 px-4 border border-black/30 rounded-xl bg-white mb-2">
            <div class="flex flex-col">
                <p class="font-medium text-lg">${c.nome}</p>
                <p class="text-sm text-gray-600">
                    Mesa <span>${c.mesa}</span> | CPF: <span>${c.cpf}</span>
                </p>
            </div>
            <div>
                ${botaoHtml}
            </div>
        </div>
        `;
    });

    lista.innerHTML = htmlGerado;
};

window.fazerCheckin = async (id, nome) => {
    try {
        const response = await fetch(`${apiUrl}/${id}/checkin`, {
            method: 'PATCH'
        });

        if (response.ok) {
            alert(`Check-in de ${nome} realizado com sucesso!`);
            await carregarConvidados();
            busca.value = "";
            lista.innerHTML = ""; 
        } else {
            alert("Erro ao realizar check-in.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
};

// PESQUISA
busca.oninput = () => {
    let valor = busca.value.toLowerCase();

    if (valor === "") {
        lista.innerHTML = "";
        return;
    }

    let filtrados = convidados.filter((pessoa) =>
        pessoa.nome.toLowerCase().includes(valor) || 
        (pessoa.cpf && pessoa.cpf.includes(valor))
    );

    mostrarConvidados(filtrados);
};

carregarConvidados();