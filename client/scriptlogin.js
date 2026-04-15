const logarConta = () =>{
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (email === "" || password === ""){
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (email == "admin@wedding.com" && password == "admin123"){
        alert("Login bem-sucedido!");
        window.location.href = "dashboard.html";
    } else{
        alert("Email ou senha incorretos. Tente novamente.");
        return
    }
}