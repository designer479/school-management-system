const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [teachers] = await connection.query(
      `SELECT t.id, t.user_id, t.full_name, t.phone, t.qualification, t.specialization
       FROM teachers t
       ORDER BY t.id`
    );
    connection.release();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [teacher] = await connection.query(
      'SELECT * FROM teachers WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (teacher.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teacher' });
  }
});

module.exports = router;
