import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Checking database schema...');

        // Check if status column exists
        const [statusRows] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'availability_windows' AND COLUMN_NAME = 'status'
        `, [process.env.DB_NAME]);

        if (statusRows.length === 0) {
            console.log('Adding "status" column...');
            await connection.execute(`
                ALTER TABLE availability_windows 
                ADD COLUMN status ENUM('available', 'busy') DEFAULT 'available' AFTER end_time
            `);
            console.log('"status" column added.');
        } else {
            console.log('"status" column already exists.');
        }

        // Check if title column exists
        const [titleRows] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'availability_windows' AND COLUMN_NAME = 'title'
        `, [process.env.DB_NAME]);

        if (titleRows.length === 0) {
            console.log('Adding "title" column...');
            await connection.execute(`
                ALTER TABLE availability_windows 
                ADD COLUMN title VARCHAR(255) NULL AFTER status
            `);
            console.log('"title" column added.');
        } else {
            console.log('"title" column already exists.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
        console.log('Migration finished.');
    }
};

migrate();
