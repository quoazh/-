import { apiUrl, token } from "../script.js";

async function fetchReg() {
  try {
    const resp = await fetch(`${apiUrl}/reg`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: document.getElementById('userName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })
    });

    const data = await resp.json();
    console.log('Успешно:', data);
    window.location.href = 'http://127.0.0.1:5500/pages/login.html';
  } catch (error) {
    console.error('Ошибка', error);
  }
}

document.getElementById('regButton').addEventListener('click', fetchReg);