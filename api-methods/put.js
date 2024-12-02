import { apiUrl, token } from "../script.js";
import { getDiaryEntries, fetchDiaryGet } from "./get.js";

document.addEventListener('DOMContentLoaded', async () => {
  await fetchDiaryGet();

  const entries = await getDiaryEntries();
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

document.getElementById('updateButton').addEventListener('click', fetchDiaryPut);