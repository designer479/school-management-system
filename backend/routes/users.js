const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT u.id, u.email, r.name as role, u.created_at FROM users u JOIN roles r ON r.id = u.role_id'
    );
    connection.release();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [user] = await connection.query(
      'SELECT u.id, u.email, r.name as role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?',
      [req.params.id]
    );
    connection.release();

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

module.exports = router;
