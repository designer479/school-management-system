const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [studentCount] = await connection.query('SELECT COUNT(*) as total FROM students');
    const [teacherCount] = await connection.query('SELECT COUNT(*) as total FROM teachers');
    const [classCount] = await connection.query('SELECT COUNT(*) as total FROM classes');
    const [notificationCount] = await connection.query('SELECT COUNT(*) as total FROM notifications');

    connection.release();

    res.json({
      totalStudents: studentCount[0].total,
      totalTeachers: teacherCount[0].total,
      totalClasses: classCount[0].total,
      totalNotifications: notificationCount[0].total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
});

module.exports = router;
