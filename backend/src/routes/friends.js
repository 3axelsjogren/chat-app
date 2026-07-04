const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/search', authenticateToken, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Ange en sökterm' });
  }

  try {
    const [users] = await pool.query(
      'SELECT id, username FROM users WHERE username LIKE ? AND id != ?',
      [`%${query}%`, req.user.userId]
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Något gick fel vid sökning' });
  }
});

router.post('/request', authenticateToken, async (req, res) => {
  const { addresseeId } = req.body;
  const requesterId = req.user.userId;

  if (!addresseeId) {
    return res.status(400).json({ error: 'Ange vem förfrågan ska skickas till' });
  }

  if (addresseeId === requesterId) {
    return res.status(400).json({ error: 'Du kan inte lägga till dig själv' });
  }

  try {
    await pool.query(
      'INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, ?)',
      [requesterId, addresseeId, 'pending']
    );
    res.status(201).json({ message: 'Vänförfrågan skickad' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Vänförfrågan finns redan' });
    }
    console.error(err);
    res.status(500).json({ error: 'Något gick fel vid vänförfrågan' });
  }
});

router.get('/pending', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [requests] = await pool.query(
      `SELECT f.id, f.requester_id, u.username AS requester_username, f.created_at
       FROM friendships f
       JOIN users u ON f.requester_id = u.id
       WHERE f.addressee_id = ? AND f.status = 'pending'`,
      [userId]
    );
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Något gick fel vid hämtning av förfrågningar' });
  }
});

router.post('/accept', authenticateToken, async (req, res) => {
  const { friendshipId } = req.body;
  const userId = req.user.userId;

  if (!friendshipId) {
    return res.status(400).json({ error: 'Ange vilken förfrågan som ska accepteras' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE friendships 
       SET status = 'accepted' 
       WHERE id = ? AND addressee_id = ? AND status = 'pending'`,
      [friendshipId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Förfrågan hittades inte eller redan hanterad' });
    }

    res.json({ message: 'Vänförfrågan accepterad' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Något gick fel vid acceptering' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [friends] = await pool.query(
      `SELECT u.id, u.username
       FROM friendships f
       JOIN users u ON u.id = CASE
         WHEN f.requester_id = ? THEN f.addressee_id
         ELSE f.requester_id
       END
       WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'`,
      [userId, userId, userId]
    );
    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Något gick fel vid hämtning av vänner' });
  }
});

router.post('/decline', authenticateToken, async (req, res) => {
  const { friendshipId } = req.body;
  const userId = req.user.userId;

  if (!friendshipId) {
    return res.status(400).json({ error: 'Ange vilken förfrågan som ska nekas' });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM friendships 
       WHERE id = ? AND addressee_id = ? AND status = 'pending'`,
      [friendshipId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Förfrågan hittades inte eller redan hanterad' });
    }

    res.json({ message: 'Vänförfrågan nekad' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Något gick fel vid nekande' });
  }
});

module.exports = router;