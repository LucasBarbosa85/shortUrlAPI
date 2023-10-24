document.addEventListener("DOMContentLoaded", function () {
  const urlForm = document.getElementById("urlForm");
  const urlInput = document.getElementById("originalUrl");
  const customPathInput = document.getElementById("customPath");
  const maxVisitsInput = document.getElementById("maxVisits");
  const expirationDateInput = document.getElementById("expirationDate");
  const linkList = document.getElementById("linkList");

  urlForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const original_url = urlInput.value;
    const custom_path = customPathInput.value;
    const max_visits = maxVisitsInput.value;
    const expiration_date = expirationDateInput.value;

    const data = {
      original_url,
      custom_path,
      max_visits,
      expiration_date,
    };

    const response = await fetch("http://localhost:3000/api/encurtar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      const result = await response.json();
      updateLinkList(result.short_url);
    } else {
      const result = await response.json();
      alert("Erro ao encurtar a URL: " + result.error);
    }
  });

  function updateLinkList(short_url) {
    const linkItem = document.createElement("li");
    linkItem.textContent = short_url;
    linkList.appendChild(linkItem);
  }

  const registrationForm = document.getElementById("registrationForm");
  const registrationUsername = document.getElementById("registrationUsername");
  const registrationEmail = document.getElementById("registrationEmail");
  const registrationPassword = document.getElementById("registrationPassword");
  const confirmPassword = document.getElementById("confirmPassword");

  registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (registrationPassword.value !== confirmPassword.value) {
      alert("As senhas não coincidem. Tente novamente.");
      return;
    }

    const data = {
      username: registrationUsername.value,
      email: registrationEmail.value,
      password: registrationPassword.value,
    };

    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      alert("Registro bem-sucedido! Faça login para acessar sua conta.");
    } else {
      const result = await response.json();
      alert("Erro no registro: " + result.error);
    }
  });

});