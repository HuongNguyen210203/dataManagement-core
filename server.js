const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:4200', // Change to match your frontend domain
  methods: 'GET,POST,PUT,DELETE', // Allowed methods
  allowedHeaders: 'Content-Type,Authorization', // Allowed headers
  credentials: true
}));

app.use(express.json());

const authRoutes = require('./authController');
const fileRoutes = require('./fileController');

app.get('/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/auth', authRoutes);
app.use('/files', fileRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

