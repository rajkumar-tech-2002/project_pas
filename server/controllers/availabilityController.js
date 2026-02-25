import db from '../db.js';

export const getAllAvailability = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM availability_windows ORDER BY date ASC, start_time ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAvailabilityByDate = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM availability_windows WHERE date = ?', [req.params.date]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createAvailability = async (req, res) => {
    const { date, start_time, end_time, status, title } = req.body;
    const availabilityStatus = status || 'available'; // Default to 'available'

    try {
        const [result] = await db.execute(
            'INSERT INTO availability_windows (date, start_time, end_time, status, title) VALUES (?, ?, ?, ?, ?)',
            [date, start_time, end_time, availabilityStatus, title || null]
        );
        res.status(201).json({ id: result.insertId, date, start_time, end_time, status: availabilityStatus, title });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAvailability = async (req, res) => {
    try {
        await db.execute('DELETE FROM availability_windows WHERE id = ?', [req.params.id]);
        res.json({ message: 'Availability window deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAvailability = async (req, res) => {
    const { start_time, end_time, status, title } = req.body;
    try {
        await db.execute(
            'UPDATE availability_windows SET start_time = ?, end_time = ?, status = ?, title = ? WHERE id = ?',
            [start_time, end_time, status || 'available', title || null, req.params.id]
        );
        res.json({ message: 'Availability window updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
