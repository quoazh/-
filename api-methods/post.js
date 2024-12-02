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
        date: new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: true}),
        category: document.getElementById('category').value
      })
    });

    const data = await resp.json();
    console.log('Успешно:', data);
  } catch (error) {
    console.error('Ошибка', error);
  }
}

document.getElementById('submitButton').addEventListener('click', fetchDiaryPost);