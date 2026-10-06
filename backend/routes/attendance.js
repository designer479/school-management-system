const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all attendance
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [attendance] = await connection.query(
      `SELECT a.*, s.full_name, c.name as class_name
       FROM attendance a
       LEFT JOIN students s ON s.id = a.student_id
       LEFT JOIN classes c ON c.id = a.class_id
       ORDER BY a.attendance_date DESC`
    );
    connection.release();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Get attendance by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [attendance] = await connection.query(
      `SELECT * FROM attendance
       WHERE student_id = ?
       ORDER BY attendance_date DESC`,
      [req.params.studentId]
    );
    connection.release();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Create attendance record
router.post('/', verifyToken, async (req, res) => {
  const { student_id, class_id, attendance_date, status, note } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO attendance (student_id, class_id, attendance_date, status, note) VALUES (?, ?, ?, ?, ?)',
      [student_id, class_id, attendance_date, status, note]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Attendance record created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create attendance record' });
  }
});

module.exports = router;
