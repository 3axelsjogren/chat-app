const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const { onlineUsers } = require('../socket');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) =>{
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    if (!receiverId) {
        return res.status(400).json({ error: 'Ange mottagare' });
    }

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Meddelandet får inte vara tomt' });
    }

    try{
        const [friendship] = await pool.query(
            `SELECT id FROM friendships
            WHERE status = 'accepted'
            AND(
              (requester_id = ? AND addressee_id = ?)
              OR
              (requester_id = ? AND addressee_id = ?)
            )`,
            [senderId, receiverId, receiverId, senderId]
        );

        if (friendship.length === 0) {
            return res.status(403).json({ error: 'Ni är inte vänner' });
        }     
        
        const [result] = await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content]
        );

        const io = req.app.get('io');
        const receiverSocketId = onlineUsers.get(Number(receiverId));

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('message:new', {
                id: result.insertId,
                sender_id: senderId,
                receiver_id: Number(receiverId),
                content,
                is_read: 0,
                created_at: new Date().toISOString(),
            });
        }

        res.status(201).json({ message: 'Meddelande skickat' });

    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Något gick fel vid skickande av meddelande'});
    }
});

router.get('/:friendId', authenticateToken, async (req, res) => {
    const friendId = req.params.friendId;
    const userId = req.user.userId;

    try {
        const [friendship] = await pool.query(
            `SELECT id FROM friendships
            WHERE status = 'accepted'
            AND(
              (requester_id = ? AND addressee_id = ?)
              OR
              (requester_id = ? AND addressee_id = ?)
            )`,
            [userId, friendId, friendId, userId]
        );

        if (friendship.length === 0) {
            return res.status(403).json({ error: 'Ni är inte vänner' });
        }

        const [messages] = await pool.query(
            `SELECT id, sender_id, receiver_id, content, is_read, created_at
            FROM messages
            WHERE (sender_id = ? AND receiver_id = ?)
                OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC`,
            [userId, friendId, friendId, userId]
        );

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Något gick fel vid hämtning av meddelanden' });
    }
});

module.exports = router;