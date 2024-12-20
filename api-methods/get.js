import { apiUrl, token } from "../script.js";

export async function fetchDiaryGet() {
  try {
    const resp = await fetch(`${apiUrl}/get`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) {
      throw new Error(`Ошибка HTTP: ${resp.status}`);
    }

    return await resp.json();
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    return [];
  }
}

export async function fetchDiaryEntries({ search = '', category = '', orderBy = 'asc' } = {}) {
  try {
    const queryParams = new URLSearchParams({
      search,
      category,
      orderBy,
    });

    const resp = await fetch(`${apiUrl}/get?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) {
      throw new Error(`Ошибка HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    displayDiaryEntries(data);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    diaryContainer.innerHTML = '<p>Ошибка загрузки данных</p>';
  }
}

export function displayDiaryEntries(entries) {
  const diaryContainer = document.querySelector('.diary-container');
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