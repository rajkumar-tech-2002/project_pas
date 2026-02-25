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
        console.log('Starting migration...');

        await connection.execute(`
            ALTER TABLE appointments 
            MODIFY COLUMN status ENUM('Active', 'InProgress', 'Completed', 'Cancelled') DEFAULT 'Active'
        `);
        console.log('Status ENUM updated.');

        await connection.execute(`
            ALTER TABLE appointments 
            ADD COLUMN actual_start_time DATETIME NULL, 
            ADD COLUMN actual_end_time DATETIME NULL, 
            ADD COLUMN actual_duration_seconds INT DEFAULT 0
        `);
        console.log('New columns added successfully.');

    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Columns already exist, continuing...');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await connection.end();
        console.log('Migration finished.');
    }
};

migrate();
