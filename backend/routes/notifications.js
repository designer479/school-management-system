const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications for user
router.get('/', async (req, res) => {
  const userId = req.query.user_id;

  try {
    const connection = await pool.getConnection();

    let query = 'SELECT * FROM notifications ORDER BY created_at DESC';
    let params = [];

    if (userId) {
      query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
      params = [userId];
    }

    const [notifications] = await connection.query(query, params);
    connection.release();

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Create notification
router.post('/', verifyToken, async (req, res) => {
  const { user_id, title, message, type } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [user_id, title, message, type || 'info']
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Notification created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

module.exports = router;
