// // authController.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const { createUser, findUserByUsername } = require('./userModel');

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Ensure to store your secret securely

// // Registration Endpoint
// router.post('/register', async (req, res) => {
//   const { username, password } = req.body;
  
//   // Check if the username already exists
//   if (findUserByUsername(username)) {
//     return res.status(400).json({ message: 'Username already exists' });
//   }
  
//   try {
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Create a new user
//     const user = createUser(username, hashedPassword);
//     res.status(201).json({ message: 'User registered successfully', userId: user.id });
//   } catch (error) {
//     res.status(500).json({ message: 'Error registering user', error });
//   }
// });

// // Login Endpoint
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const user = findUserByUsername(username);

//   if (!user) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   // Compare provided password with stored hashed password
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   // Generate JWT token valid for 1 hour
//   const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
//   res.json({ message: 'Login successful', token });
// });

// module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUser, findUserByUsername } = require('./userModel');
const { findAllUsers } = require('./userModel'); //moi thenm
const verifyToken = require('./authMiddleware'); // Import the token verification middleware

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
  const user = await findUserByUsername(username);

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
//mowis theem
// Protected Profile Route
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'User profile retrieved successfully',
    user: req.user,  // This is the user data attached by the middleware
  });
});

// GET all users (protected route)
router.get('/users', verifyToken, (req, res) => {
  const users = findAllUsers();
  res.json(users);
});

module.exports = router;
