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
        console.log('Starting orientation migration...');

        await connection.execute(`
            ALTER TABLE availability_windows 
            ADD COLUMN IF NOT EXISTS status ENUM('available', 'busy') DEFAULT 'available' AFTER end_time
        `);
        console.log('Column "status" added or already exists.');

        await connection.execute(`
            ALTER TABLE availability_windows 
            ADD COLUMN IF NOT EXISTS title VARCHAR(255) NULL AFTER status
        `);
        console.log('Column "title" added or already exists.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
        console.log('Migration finished.');
    }
};

migrate();
