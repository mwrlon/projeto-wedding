// MENU
let burgermenu = document.getElementById("burgermenu");
let navlinks = document.getElementById("navlinks");

burgermenu.onclick = () => {
  navlinks.classList.toggle("hidden");
};

// LOGOUT
document.querySelectorAll("#logoutButton").forEach((botao) => {
  botao.onclick = () => {
    if (confirm("Tem certeza de que deseja sair?")) {
      window.location.href = "login.html";
    }
  };
});

// ======================
// CHECK-IN
// ======================

let lista = document.getElementById("listaBusca");
let template = document.getElementById("cardbusca");
let busca = document.getElementById("busca");

let convidados = [];

// MOSTRAR CONVIDADOS
const mostrarConvidados = (listaConvidados) => {
  lista.innerHTML = "";

  listaConvidados.forEach((pessoa) => {
    let clone = template.content.cloneNode(true);

    clone.querySelector(".nomepessoa").innerText = pessoa.nome;
    clone.querySelector(".mesa").innerText = pessoa.mesa;

    clone.querySelector("button").onclick = () => {
      alert("Check-in realizado!");
    };

    lista.appendChild(clone);
  });
}

// PESQUISA
busca.oninput = () => {
  let valor = busca.value.toLowerCase();

  // se estiver vazio
  if (valor === "") {
    lista.innerHTML = "";
    return;
  }

  let filtrados = convidados.filter((pessoa) =>
    pessoa.nome.toLowerCase().includes(valor)
  );

  mostrarConvidados(filtrados);
};