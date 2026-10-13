const apiUrl = `${API_BASE}/login`;

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
            setToken(data.token);
            alert("Login bem-sucedido!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || data.error || "Erro ao fazer login.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao conectar com o servidor.");
    }
}