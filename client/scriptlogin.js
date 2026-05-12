const apiUrl = 'http://localhost:3000/api/login';

const logarConta = async() => {
    const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("password").value;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput, senha: passwordInput })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("Login bem-sucedido!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Erro ao fazer login.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao conectar com o servidor.");
    }
}