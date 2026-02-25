-- Run this script as 'root' or an admin user in MySQL to fix access issues.

CREATE USER IF NOT EXISTS 'myuser'@'localhost' IDENTIFIED BY 'MyPassword';
GRANT ALL PRIVILEGES ON PAS.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;

-- Also ensure the database exists
CREATE DATABASE IF NOT EXISTS PAS;

USE PAS;

-- The actual table creation is in schema.sql
