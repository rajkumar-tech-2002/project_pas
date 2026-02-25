import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const check = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute('DESCRIBE appointments');
        console.table(rows);
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await connection.end();
    }
};

check();
