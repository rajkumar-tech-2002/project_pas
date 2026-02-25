import db from '../db.js';

export const login = async (req, res) => {
    const { username, password, role } = req.body;

    // Block student login attempts
    if (role === 'Student') {
        return res.status(403).json({ error: 'Student login is not allowed. Only Admin and Staff can access this system.' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?',
            [username, password, role]
        );

        if (rows.length > 0) {
            const user = rows[0];
            // Don't send password back
            delete user.password;
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials or role' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
