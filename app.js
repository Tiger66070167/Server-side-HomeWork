require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Database connected
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) {
    console.error('database fail to connected', err);
    return;
  }
  console.log('database connect success!');
});

// API: GET /products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(588).json({ error: err });
    res.json(results);
  });
});

// เว้นบรรทัด :3
app.set('json spaces', 2);

// API: GET /products/:id
app.get('/products/:id', (req, res) => {
  db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(588).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    res.json(results[0]);
  });
});

// API: GET /products/search/:keyword
app.get('/products/search/:keyword', (req, res) => {
  const keyword = `%${req.params.keyword}%`;
  db.query('SELECT * FROM products WHERE name LIKE ?', [keyword], (err, results) => {
    if (err) return res.status(588).json({ error: err });
    res.json(results);
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
