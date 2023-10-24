document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

      
        const data = {
            username,
            password,
        };

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.status === 200) {
 
                window.location.href = "index.html";
            } else {
                const result = await response.json();
                errorMessage.textContent = result.error;
            }
        } catch (error) {
            errorMessage.textContent = "Erro ao fazer login. Tente novamente mais tarde.";
        }
    });
});