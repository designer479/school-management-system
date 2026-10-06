const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get chat messages from thread
router.get('/messages/:threadId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [messages] = await connection.query(
      `SELECT cm.id, cm.message, cm.created_at, u.email as sender_email
       FROM chat_messages cm
       JOIN users u ON u.id = cm.sender_id
       WHERE cm.thread_id = ?
       ORDER BY cm.created_at ASC`,
      [req.params.threadId]
    );
    connection.release();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Get all chat threads
router.get('/threads', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [threads] = await connection.query(
      `SELECT ct.*, u.email FROM chat_threads ct
       JOIN users u ON u.id = ct.created_by
       ORDER BY ct.created_at DESC`
    );
    connection.release();
    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch threads' });
  }
});

// Create message
router.post('/messages', verifyToken, async (req, res) => {
  const { thread_id, sender_id, message } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO chat_messages (thread_id, sender_id, message) VALUES (?, ?, ?)',
      [thread_id, sender_id, message]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Create chat thread
router.post('/threads', verifyToken, async (req, res) => {
  const { title, created_by, type } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO chat_threads (title, created_by, type) VALUES (?, ?, ?)',
      [title, created_by, type || 'group']
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Thread created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create thread' });
  }
});

module.exports = router;
