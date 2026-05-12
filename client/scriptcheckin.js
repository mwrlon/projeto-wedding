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

let lista = document.getElementById("listaBusca");
let template = document.getElementById("cardBusca");
let busca = document.getElementById("busca");

let convidados = [];

// MOSTRAR CONVIDADOS
const mostrarConvidados = (listaConvidados) => {
  lista.innerHTML = "";

  listaConvidados.forEach((pessoa) => {
    let clone = template.content.cloneNode(true);

    clone.querySelector("#nomepessoa").innerText = pessoa.nome;
    clone.querySelector("#mesa").innerText = pessoa.mesa;

    clone.querySelector("button").onclick = () => {
      alert("Check-in realizado!");
    };

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

  let filtrados = convidados.filter((pessoa) =>
    pessoa.nome.toLowerCase().includes(valor)
  );

  mostrarConvidados(filtrados);
};