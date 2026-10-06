const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.query(
      `SELECT s.id, s.full_name, s.roll_no, s.admission_no, c.name AS class_name, c.section
       FROM students s
       LEFT JOIN classes c ON c.id = s.class_id
       ORDER BY s.id`
    );
    connection.release();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [student] = await connection.query(
      `SELECT s.*, c.name AS class_name FROM students s
       LEFT JOIN classes c ON c.id = s.class_id
       WHERE s.id = ?`,
      [req.params.id]
    );
    connection.release();

    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

// Create student
router.post('/', verifyToken, async (req, res) => {
  const { user_id, full_name, admission_no, roll_no, class_id } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO students (user_id, full_name, admission_no, roll_no, class_id) VALUES (?, ?, ?, ?, ?)',
      [user_id, full_name, admission_no, roll_no, class_id]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Student created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student' });
  }
});

module.exports = router;
