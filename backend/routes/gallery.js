const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      `SELECT g.*, u.email FROM gallery g
       LEFT JOIN users u ON u.id = g.uploaded_by
       ORDER BY g.created_at DESC`
    );
    connection.release();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch gallery' });
  }
});

// Create gallery item
router.post('/', verifyToken, async (req, res) => {
  const { title, image_url, uploaded_by } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO gallery (title, image_url, uploaded_by) VALUES (?, ?, ?)',
      [title, image_url, uploaded_by]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Gallery item created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create gallery item' });
  }
});

module.exports = router;
