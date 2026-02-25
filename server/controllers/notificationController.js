import db from '../db.js';

export const getNotifications = async (req, res) => {
    const { userId, role } = req.query;
    try {
        let query = 'SELECT * FROM notifications WHERE ';
        let params = [];

        if (role === 'Admin') {
            query += 'role = "Admin" ';
        } else {
            query += 'user_id = ? ';
            params.push(userId);
        }

        query += 'ORDER BY created_at DESC LIMIT 50';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM notifications WHERE id = ?', [id]);
        res.json({ message: 'Notification cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    const { userId, role } = req.body;
    try {
        let query = 'DELETE FROM notifications WHERE ';
        let params = [];

        if (role === 'Admin') {
            query += 'role = "Admin"';
        } else {
            query += 'user_id = ?';
            params.push(userId);
        }

        await db.execute(query, params);
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createNotification = async (userId, role, message, type, relatedId) => {
    try {
        await db.execute(
            'INSERT INTO notifications (user_id, role, message, type, related_id) VALUES (?, ?, ?, ?, ?)',
            [userId, role, message, type, relatedId]
        );
    } catch (error) {
        console.error('Error creating notification:', error.message);
    }
};
