import { apiUrl, token } from "../script.js";

const diaryContainer = document.querySelector('.diary-read-container');
const toggleOrderButton = document.getElementById('toggle-order');
const applyFiltersButton = document.getElementById('apply-filters');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

let isDescending = false; // Переменная для отслеживания состояния сортировки

// Функция для получения записей с фильтрацией
async function fetchDiaryEntries({ search = '', category = '', orderBy = 'asc' } = {}) {
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

// Функция для отображения записей
function displayDiaryEntries(entries) {
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

// Обработчик для кнопки переключения
toggleOrderButton.addEventListener('click', () => {
  isDescending = !isDescending; // Меняем порядок
  const orderBy = isDescending ? 'desc' : 'asc'; // Выбираем сортировку
  toggleOrderButton.textContent = isDescending ? 'Новые записи' : 'Старые записи';

  const search = searchInput.value.trim();
  const category = categoryFilter.value;
  fetchDiaryEntries({ search, category, orderBy });
});

// Обработчик для применения фильтров
applyFiltersButton.addEventListener('click', () => {
  const search = searchInput.value.trim();
  const category = categoryFilter.value;
  const orderBy = isDescending ? 'desc' : 'asc';

  fetchDiaryEntries({ search, category, orderBy });
});

// Начальная загрузка
fetchDiaryEntries();