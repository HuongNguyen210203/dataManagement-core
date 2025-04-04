// authController.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUser, findUserByUsername } = require('./userModel');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Ensure to store your secret securely

// Registration Endpoint
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Check if the username already exists
  if (findUserByUsername(username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const user = createUser(username, hashedPassword);
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = findUserByUsername(username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Compare provided password with stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token valid for 1 hour
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

module.exports = router;

