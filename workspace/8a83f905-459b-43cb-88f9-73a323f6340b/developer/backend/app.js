const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const calculatorRoutes = require('./routes/calculator');
const errorHandler = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/calculator', calculatorRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});