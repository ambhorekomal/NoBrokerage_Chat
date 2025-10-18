// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const searchRoutes = require('./routes/search');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/search', searchRoutes);

// health
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on port ${PORT}`);
});
