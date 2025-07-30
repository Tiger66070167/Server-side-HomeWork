require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2); // จัดระเบียบ JSON response

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected successfully!');
});



// GET: All products (excluding soft-deleted)
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products WHERE is_deleted = 0', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET: Single product by ID
app.get('/products/:id', (req, res) => {
  db.query(
    'SELECT * FROM products WHERE id = ? AND is_deleted = 0',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
      res.json(results[0]);
    }
  );
});

// GET: Search products by keyword
app.get('/products/search/:keyword', (req, res) => {
  const keyword = `%${req.params.keyword}%`;
  db.query(
    'SELECT * FROM products WHERE name LIKE ? AND is_deleted = 0',
    [keyword],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// POST: Add new product
app.post('/products', (req, res) => {
  const { name, price, discount, review_count, image_url } = req.body || {};

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.query(
    'INSERT INTO products (name, price, discount, review_count, image_url) VALUES (?, ?, ?, ?, ?)',
    [name, price, discount, review_count, image_url],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId, message: 'Product created' });
    }
  );
});

// PUT: Edit product
app.put('/products/:id', (req, res) => {
  const { name, price, discount, review_count, image_url } = req.body || {};

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.query(
    'UPDATE products SET name = ?, price = ?, discount = ?, review_count = ?, image_url = ? WHERE id = ?',
    [name, price, discount, review_count, image_url, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product updated' });
    }
  );
});

// DELETE: Soft delete product
app.delete('/products/:id', (req, res) => {
  db.query(
    'UPDATE products SET is_deleted = 1 WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product soft-deleted successfully' });
    }
  );
});

// PATCH: Restore soft-deleted product
app.patch('/products/:id/restore', (req, res) => {
  db.query(
    'UPDATE products SET is_deleted = 0 WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product restored successfully' });
    }
  );
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
