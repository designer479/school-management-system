const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [jobs] = await connection.query(
      `SELECT j.*, u.email FROM jobs j
       LEFT JOIN users u ON u.id = j.posted_by
       ORDER BY j.created_at DESC`
    );
    connection.release();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Create job
router.post('/', verifyToken, async (req, res) => {
  const { title, description, location, posted_by, deadline } = req.body;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO jobs (title, description, location, posted_by, deadline) VALUES (?, ?, ?, ?, ?)',
      [title, description, location, posted_by, deadline]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Job created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job' });
  }
});

module.exports = router;
