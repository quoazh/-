const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key';  // Прямо здесь задайте свой секретный ключ
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())

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

const dbPath = path.join(__dirname, 'database', 'database.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log('Ошибка подключения к базе данных', err.message);
  } else {
    console.log('База данных подключена');
  }
});

app.get('/api/get', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM diary WHERE user_id = ?';
  db.all(query, [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении записей.' });
    }

    res.json(rows);
  });
});

app.post('/api/post', authenticateToken, (req, res) => {
  const { title, paragraph, date, category } = req.body;

  if (!title || !paragraph || !date || !category) {
    return res.status(400).json({ error: 'Заполните все поля.' });
  }

  const query = 'INSERT INTO diary (title, paragraph, date, category, user_id) VALUES (?, ?, ?, ?, ?)';
  const values = [title, paragraph, date, category, req.user.userId];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при добавлении записи.' });
    }

    res.status(201).json({ message: 'Запись добавлена.', id: this.lastID });
  });
});

app.put('/api/put/:id', (req, res) => {
  const { id } = req.params;
  const { title, paragraph, date, category } = req.body;

  if (!title || !paragraph || !date || !category) {
    return res.status(400).json({ error: 'Заполните все поля.' });
  }

  const query = `
    UPDATE diary
    SET title = ?, paragraph = ?, date = ?, category = ?
    WHERE id = ?
  `;

  const values = [title, paragraph, date, category, id];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    res.status(200).json({ message: 'Обнавлено' })
  })
});

app.post('/api/reg', (req, res) => {
  const { userName, email, password} = req.body;

  if (!userName || !email || !password) {
    res.status(400).json({ error: 'Заполните все поля' });
  }

  try {
    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR userName = ?';

    db.get(checkUserQuery, [email, userName], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (user) return res.status(400).json({ error: 'Такой пользователь уже есть' });

      const hashPassword = await bcrypt.hash(password, 10);

      const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.run(insertQuery, [userName, email, hashPassword], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: 'Регистрация завершена' })
      })
    })
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
});

app.get('/api/reg/get', (req, res) => {
  const query = 'SELECT * FROM users';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message});
      console.log('Отправленные данные:', rows);
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль.' });
    }

    try {
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.log('Ошибка при создании токена:', error);
      res.status(500).json({ error: 'Ошибка при создании токена.' });
    }
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}/api/get`);
})