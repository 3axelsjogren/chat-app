require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/routes/auth');
const friendsRoutes = require('./src/routes/friends');
const messageRoutes = require('./src/routes/messages');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// API-routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messageRoutes);

// Servera den byggda frontend-appen
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Allt som inte är en API-route skickas till Vue-appen (för client-side routing)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Servern kör på http://localhost:${port}`);
});