import { apiUrl } from "../script.js";

async function fetchLogin() {
  try {
    const resp = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })
    });

    const data = await resp.json();
    localStorage.setItem('token', data.token);
    window.location.href = 'http://127.0.0.1:5500/index.html';
  } catch (error) {
    console.error('Ошибка', error);
  }
}

document.getElementById('logButton').addEventListener('click', fetchLogin);