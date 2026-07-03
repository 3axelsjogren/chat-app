require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('tjena tjena, express fungerar!');
});

app.listen(port, () => {
  console.log(`Servern kör på http://localhost:${port}`);
});