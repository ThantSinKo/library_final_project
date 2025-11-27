const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// ==================== BOOKS ENDPOINTS ====================

// GET /api/books - Get all books with optional filters
app.get('/api/books', async (req, res) => {
  try {
    const { genre, author, available } = req.query;
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (genre) {
      query += ' AND genre = ?';
      params.push(genre);
    }
    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }
    if (available === 'true') {
      query += ' AND available_copies > 0';
    }

    query += ' ORDER BY title ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/books/:id - Get single book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/books - Add new book
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, isbn, publisher, published_year, genre, description, cover_image, pages, total_copies } = req.body;
    
    if (!title || !author || !isbn || !published_year || !genre) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const available_copies = total_copies || 1;
    
    const [result] = await pool.query(
      `INSERT INTO books (title, author, isbn, publisher, published_year, genre, description, cover_image, pages, available_copies, total_copies) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn, publisher, published_year, genre, description, cover_image, pages, available_copies, total_copies || 1]
    );

    res.status(201).json({ id: result.insertId, message: 'Book added successfully' });
  } catch (e) {
    console.error(e);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Book with this ISBN already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/books/:id - Update book
app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, publisher, published_year, genre, description, cover_image, pages, total_copies } = req.body;
    
    const [result] = await pool.query(
      `UPDATE books SET title = ?, author = ?, publisher = ?, published_year = ?, genre = ?, description = ?, cover_image = ?, pages = ?, total_copies = ? 
       WHERE id = ?`,
      [title, author, publisher, published_year, genre, description, cover_image, pages, total_copies, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/books/:id - Delete book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/books/search - Search books
app.get('/api/books/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR description LIKE ?`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==================== USERS ENDPOINTS ====================

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, full_name, member_since, status FROM users ORDER BY member_since DESC');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/users/:id - Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, full_name, member_since, status FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, full_name } = req.body;
    
    if (!username || !email || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const member_since = new Date().toISOString().split('T')[0];

    const [result] = await pool.query(
      'INSERT INTO users (username, email, full_name, member_since, status) VALUES (?, ?, ?, ?, ?)',
      [username, email, full_name, member_since, 'active']
    );

    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (e) {
    console.error(e);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/users/:id/history - Get user borrowing history
app.get('/api/users/:id/history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, bk.title, bk.author, bk.cover_image 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.user_id = ? 
       ORDER BY b.borrowed_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==================== BORROWINGS ENDPOINTS ====================

// GET /api/borrowings - Get all borrowings
app.get('/api/borrowings', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, bk.title, bk.author, u.username, u.full_name 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       JOIN users u ON b.user_id = u.id 
       ORDER BY b.borrowed_date DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/borrowings - Borrow a book
app.post('/api/borrowings', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { book_id, user_id } = req.body;

    if (!book_id || !user_id) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if book is available
    const [book] = await connection.query('SELECT available_copies FROM books WHERE id = ?', [book_id]);
    if (book.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book[0].available_copies <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Book not available' });
    }

    // Check if user exists and is active
    const [user] = await connection.query('SELECT status FROM users WHERE id = ?', [user_id]);
    if (user.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'User not found' });
    }
    if (user[0].status !== 'active') {
      await connection.rollback();
      return res.status(400).json({ error: 'User account is not active' });
    }

    const borrowed_date = new Date().toISOString().split('T')[0];
    const due_date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 14 days from now

    // Create borrowing record
    const [result] = await connection.query(
      'INSERT INTO borrowings (book_id, user_id, borrowed_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [book_id, user_id, borrowed_date, due_date, 'borrowed']
    );

    // Decrease available copies
    await connection.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);

    await connection.commit();
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Book borrowed successfully',
      due_date: due_date
    });
  } catch (e) {
    await connection.rollback();
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

// PUT /api/borrowings/:id/return - Return a book
app.put('/api/borrowings/:id/return', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [borrowing] = await connection.query('SELECT * FROM borrowings WHERE id = ?', [req.params.id]);
    if (borrowing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Borrowing record not found' });
    }
    if (borrowing[0].status === 'returned') {
      await connection.rollback();
      return res.status(400).json({ error: 'Book already returned' });
    }

    const returned_date = new Date().toISOString().split('T')[0];

    // Update borrowing record
    await connection.query(
      'UPDATE borrowings SET returned_date = ?, status = ? WHERE id = ?',
      [returned_date, 'returned', req.params.id]
    );

    // Increase available copies
    await connection.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [borrowing[0].book_id]);

    await connection.commit();
    res.json({ message: 'Book returned successfully' });
  } catch (e) {
    await connection.rollback();
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

// GET /api/borrowings/overdue - Get overdue borrowings
app.get('/api/borrowings/overdue', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT b.*, bk.title, bk.author, u.username, u.full_name, u.email 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       JOIN users u ON b.user_id = u.id 
       WHERE b.due_date < ? AND b.status = 'borrowed'
       ORDER BY b.due_date ASC`,
      [today]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==================== REVIEWS ENDPOINTS ====================

// GET /api/reviews/book/:bookId - Get reviews for a book
app.get('/api/reviews/book/:bookId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.username, u.full_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.book_id = ? 
       ORDER BY r.review_date DESC`,
      [req.params.bookId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/reviews - Add a review
app.post('/api/reviews', async (req, res) => {
  try {
    const { book_id, user_id, rating, comment } = req.body;

    if (!book_id || !user_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review_date = new Date().toISOString().split('T')[0];

    const [result] = await pool.query(
      'INSERT INTO reviews (book_id, user_id, rating, comment, review_date) VALUES (?, ?, ?, ?, ?)',
      [book_id, user_id, rating, comment, review_date]
    );

    res.status(201).json({ id: result.insertId, message: 'Review added successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/reviews/:id - Update review
app.put('/api/reviews/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const [result] = await pool.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/reviews/:id - Delete review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==================== STATS ENDPOINT ====================

// GET /api/stats - Get library statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [totalBooks] = await pool.query('SELECT COUNT(*) as count FROM books');
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const [activeBorrowings] = await pool.query('SELECT COUNT(*) as count FROM borrowings WHERE status = "borrowed"');
    const [totalReviews] = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const [overdueBooks] = await pool.query(
      'SELECT COUNT(*) as count FROM borrowings WHERE due_date < CURDATE() AND status = "borrowed"'
    );

    res.json({
      total_books: totalBooks[0].count,
      total_users: totalUsers[0].count,
      active_borrowings: activeBorrowings[0].count,
      total_reviews: totalReviews[0].count,
      overdue_books: overdueBooks[0].count
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==================== START SERVER ====================

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
