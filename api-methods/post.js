import { apiUrl, token } from "../script.js";

async function fetchDiaryPost() {
  try {
    const resp = await fetch(`${apiUrl}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: document.getElementById('title').value,
        paragraph: document.getElementById('paragraph').value,
        date: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', hour12: true }),
        category: document.getElementById('category').value
      })
    });

    const data = await resp.json();
    console.log('Успешно:', data);
    window.location.href = 'http://127.0.0.1:5500/index.html';
  } catch (error) {
    console.error('Ошибка', error);
  }
}

document.getElementById('submitButton').addEventListener('click', fetchDiaryPost);