import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,

  // ⭐⭐⭐ IMPORTANT FIX
  dateStrings: true,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const db = mysql.createPool(dbConfig);

// Test database connection and log status
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Host: ${dbConfig.host}`);
    console.log(`📦 Database: ${dbConfig.database}`);
    console.log(`🔌 Port: ${dbConfig.port}`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database configuration in .env file');
  }
};

// Execute connection test
testConnection();

// Handle pool errors
db.on('error', (err) => {
  console.error('Database pool error:', err);
});

export default db;
