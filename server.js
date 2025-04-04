const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

