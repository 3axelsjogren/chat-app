const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hej Axel, Express fungerar!');
});

app.listen(port, () => {
  console.log(`Servern kör på http://localhost:${port}`);
});
