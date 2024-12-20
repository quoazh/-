import { apiUrl, token } from "../script.js";
import { fetchDiaryGet } from './get.js';

document.addEventListener('DOMContentLoaded', async () => {
  const entries = await fetchDiaryGet();
  displayPutEntries(entries);
});

function displayPutEntries(entries) {
  const diaryList = document.querySelector('.diary-read-container');

  diaryList.innerHTML = entries.map(entry => `
    <option value="${entry.id}">${entry.title} ${entry.date}</option>
  `).join('');
}

async function fetchDiaryPut() {
  const id = document.querySelector('.diary-read-container').value;

  try {
    const resp = await fetch(`${apiUrl}/put/${id}`, {
      method: 'PUT',
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

    if (!resp.ok) {
      throw new Error(data.error || 'Не удалось обновить запись');
    }

    console.log('Успешно обновлено:', data);
    alert('Запись обновлена успешно!');
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось обновить запись.');
  }
}

document.getElementById('updateButton').addEventListener('click', fetchDiaryPut);