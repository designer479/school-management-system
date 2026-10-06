const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, role, fullName } = req.body;

  try {
    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if user exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get role ID
    const [roleResult] = await connection.query(
      'SELECT id FROM roles WHERE name = ?',
      [role]
    );

    if (roleResult.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid role' });
    }

    const roleId = roleResult[0].id;
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)',
      [email, passwordHash, roleId]
    );

    const userId = userResult.insertId;

    // Insert role-specific data
    if (role === 'admin') {
      await connection.query(
        'INSERT INTO admins (user_id, full_name) VALUES (?, ?)',
        [userId, fullName]
      );
    } else if (role === 'teacher') {
      await connection.query(
        'INSERT INTO teachers (user_id, full_name) VALUES (?, ?)',
        [userId, fullName]
      );
    } else if (role === 'parent') {
      await connection.query(
        'INSERT INTO parents (user_id, full_name) VALUES (?, ?)',
        [userId, fullName]
      );
    } else if (role === 'student') {
      const admissionNo = 'STD-' + Date.now();
      await connection.query(
        'INSERT INTO students (user_id, full_name, admission_no) VALUES (?, ?, ?)',
        [userId, fullName, admissionNo]
      );
    }

    connection.release();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();

    const [userResult] = await connection.query(
      `SELECT u.id, u.email, u.password_hash, r.name as role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?`,
      [email]
    );

    connection.release();

    if (userResult.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
