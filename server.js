const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key';
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен.' });
    }

    req.user = user;
    next();
  });
}

const dbPath = path.join(__dirname, 'database', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log('Ошибка подключения к базе данных', err.message);
  } else {
    console.log('База данных подключена');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      paragraph TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);
});

app.get('/api/get', authenticateToken, (req, res) => {
  const { search = '', category = '', orderBy = 'asc' } = req.query;

  let query = 'SELECT * FROM diary WHERE user_id = ?';
  const params = [req.user.userId];

  if (search) {
    query += ' AND (title LIKE ? OR paragraph LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ` ORDER BY date ${orderBy === 'desc' ? 'DESC' : 'ASC'}`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении записей.' });
    }

    res.json(rows);
  });
});

app.post('/api/post', authenticateToken, (req, res) => {
  const { title, paragraph, date, category } = req.body;

  if (!title || !paragraph || !date || !category) {
    return res.status(400).json({ error: 'Все поля должны быть заполнены' });
  }

  const query = `
    INSERT INTO diary (user_id, title, paragraph, date, category)
    VALUES (?, ?, ?, ?, ?)
  `;

  const params = [req.user.userId, title, paragraph, date, category];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при добавлении записи' });
    }

    res.status(201).json({ message: 'Запись добавлена', id: this.lastID });
  });
});

app.put('/api/put/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, paragraph, date, category } = req.body;

  if (!title || !paragraph || !date || !category) {
    return res.status(400).json({ error: 'Заполните все поля.' });
  }

  const query = `
    UPDATE diary
    SET title = ?, paragraph = ?, date = ?, category = ?
    WHERE id = ? AND user_id = ?
  `;

  const values = [title, paragraph, date, category, id, req.user.userId];

  db.run(query, values, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Запись не найдена.' });
    }

    res.status(200).json({ message: 'Запись обновлена.' });
  });
});

app.post('/api/reg', (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    return res.status(400).json({ error: 'Заполните все поля.' });
  }

  const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';

  db.get(checkUserQuery, [email, userName], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) return res.status(400).json({ error: 'Такой пользователь уже существует.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.run(insertQuery, [userName, email, hashedPassword], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ message: 'Регистрация завершена.' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля.' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при поиске пользователя.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль.' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});