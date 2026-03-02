import db from '../db.js';
import { createNotification } from './notificationController.js';

const formatDateDMY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
};

export const getAllAppointments = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM appointments ORDER BY date DESC, start_time ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAppointmentsByDate = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM appointments WHERE date = ? AND status != "Cancelled"', [req.params.date]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const saveAppointment = async (req, res) => {
    const { user_id, username, role, date, start_time, end_time, duration_minutes, purpose } = req.body;
    try {
        // Fetch full_name to store instead of username
        const [users] = await db.execute('SELECT full_name FROM users WHERE username = ?', [username]);
        const nameToStore = (users.length > 0 && users[0].full_name) ? users[0].full_name : username;

        const [result] = await db.execute(
            'INSERT INTO appointments (user_id, username, role, date, start_time, end_time, duration_minutes, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Active")',
            [user_id, nameToStore, role, date, start_time, end_time, duration_minutes, purpose]
        );

        // Notify Admin
        await createNotification(
            user_id,
            'Admin',
            `New appointment booked by ${nameToStore} for ${formatDateDMY(date)} at ${start_time}`,
            'APPOINTMENT_BOOKED',
            result.insertId
        );

        res.status(201).json({ id: result.insertId, ...req.body, username: nameToStore, status: 'Active' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

        // Notify User
        const [appointment] = await db.execute('SELECT user_id, role, date, start_time FROM appointments WHERE id = ?', [req.params.id]);
        if (appointment.length > 0) {
            await createNotification(
                appointment[0].user_id,
                appointment[0].role,
                `Your appointment on ${formatDateDMY(appointment[0].date)} at ${appointment[0].start_time} updated to ${status}`,
                'STATUS_CHANGED',
                req.params.id
            );
        }

        res.json({ message: 'Appointment status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rescheduleAppointment = async (req, res) => {
    const { date, start_time, end_time, duration_minutes } = req.body;
    try {
        await db.execute(
            'UPDATE appointments SET date = ?, start_time = ?, end_time = ?, duration_minutes = ?, status = "Active" WHERE id = ?',
            [date, start_time, end_time, duration_minutes, req.params.id]
        );
        res.json({ message: 'Appointment rescheduled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        await db.execute('DELETE FROM appointments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Appointment deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status != 'Cancelled' THEN duration_minutes ELSE 0 END) as totalMinutesBooked
            FROM appointments
        `);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getStrategicInsights = async (req, res) => {
    try {
        // 1. Staff Participation Rate
        // (Unique staff with appointments) / (Total staff) * 100
        const [staffParticipationRows] = await db.execute(`
            SELECT 
                (SELECT COUNT(DISTINCT user_id) FROM appointments WHERE role = 'Staff') as activeStaff,
                (SELECT COUNT(*) FROM users WHERE role = 'Staff') as totalStaff
        `);
        const { activeStaff, totalStaff } = staffParticipationRows[0];
        const staffParticipation = totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0;

        // 2. Portal Traffic (System Load Factor)
        // (Total duration of appointments) / (Total duration of availability windows in the last 30 days)
        // For simplicity, we use total duration ever if date range isn't specified, 
        // but let's compare last 30 days for better insight.
        const [trafficRows] = await db.execute(`
            SELECT 
                (SELECT SUM(duration_minutes) FROM appointments WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalBookedMinutes,
                (SELECT SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)) FROM availability_windows WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalAvailableMinutes
        `);
        const { totalBookedMinutes, totalAvailableMinutes } = trafficRows[0];
        const portalTraffic = totalAvailableMinutes > 0 ? Math.round((totalBookedMinutes / totalAvailableMinutes) * 100) : 0;

        let trafficLevel = 'Low Demand';
        if (portalTraffic > 70) trafficLevel = 'High Demand';
        else if (portalTraffic > 40) trafficLevel = 'Moderate Demand';

        // 3. Peak Hour and System Tip
        const [peakHourRows] = await db.execute(`
            SELECT HOUR(start_time) as hour, COUNT(*) as count 
            FROM appointments 
            GROUP BY hour 
            ORDER BY count DESC 
            LIMIT 1
        `);

        let systemTip = "Peak appointment hours are identified based on your booking history. Consider opening slots during off-peak times.";
        let peakHourText = "";

        if (peakHourRows.length > 0) {
            const peakHour = peakHourRows[0].hour;
            const hour12 = peakHour % 12 || 12;
            const ampm = peakHour >= 12 ? 'PM' : 'AM';
            peakHourText = `${hour12} ${ampm}`;
            systemTip = `Peak activity is around ${peakHourText}. Consider opening additional slots around this time to handle the volume.`;
        }

        res.json({
            staffParticipation,
            portalTraffic,
            trafficLevel,
            systemTip
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const startMeeting = async (req, res) => {
    try {
        const [result] = await db.execute(
            'UPDATE appointments SET actual_start_time = NOW(), status = "InProgress" WHERE id = ? AND status = "Active"',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Appointment not found or already started' });
        }

        res.json({ message: 'Meeting started successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const completeMeeting = async (req, res) => {
    try {
        // Fetch start time to calculate duration
        const [rows] = await db.execute('SELECT actual_start_time FROM appointments WHERE id = ?', [req.params.id]);

        if (rows.length === 0 || !rows[0].actual_start_time) {
            return res.status(400).json({ error: 'Meeting has not been started' });
        }

        const actualStartTime = new Date(rows[0].actual_start_time);
        const actualEndTime = new Date();
        const durationSeconds = Math.floor((actualEndTime - actualStartTime) / 1000);

        await db.execute(
            'UPDATE appointments SET actual_end_time = NOW(), actual_duration_seconds = ?, status = "Completed" WHERE id = ?',
            [durationSeconds, req.params.id]
        );

        res.json({ message: 'Meeting completed successfully', durationSeconds });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getReportData = async (req, res) => {
    const { startDate, endDate, status } = req.query;
    try {
        let query = 'SELECT * FROM appointments WHERE 1=1';
        let params = [];

        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate);
        }
        if (status && status !== 'All') {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY date DESC, start_time ASC';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
