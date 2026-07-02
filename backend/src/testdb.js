const pool = require('./db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultat');
    console.log('Anslutning funkar! Resultat:', rows[0].resultat);
  } catch (err) {
    console.error('Anslutningsfel:', err.message);
  } finally {
    process.exit();
  }
}

test();
