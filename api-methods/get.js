import { apiUrl, token } from "../script.js";

const diaryContainer = document.querySelector('.diary-read-container');
let diaryEntries = [];

export async function fetchDiaryGet() {
  try {
    const resp = await fetch(`${apiUrl}/get`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
      throw new Error(`Ошибка HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    diaryEntries = data;
    displayDiaryGet(data);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    diaryContainer.innerHTML = '<p>Нет записей</p>';
  }
}

export async function getDiaryEntries() {
  return diaryEntries;
}

function displayDiaryGet(entries) {
  diaryContainer.innerHTML = '';

  entries.forEach(entry => {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('diary-entry');

    entryDiv.innerHTML = `
      <h2>${entry.title}</h2>
      <p>${entry.paragraph}</p>
      <p>Date: <strong>${entry.date}</strong></p>
      <p>Category: <strong>${entry.category}</strong></p>
    `;

    diaryContainer.appendChild(entryDiv);
  });
}

fetchDiaryGet();