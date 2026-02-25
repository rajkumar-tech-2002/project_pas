CREATE DATABASE IF NOT EXISTS PAS;
USE PAS;

CREATE TABLE IF NOT EXISTS availability_windows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('available', 'busy') DEFAULT 'available',
    title VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    purpose TEXT,
    status ENUM('Active', 'InProgress', 'Completed', 'Cancelled') DEFAULT 'Active',
    actual_start_time DATETIME NULL,
    actual_end_time DATETIME NULL,
    actual_duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Staff', 'Student') NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Users (Passwords are plain text for initial testing, should be hashed in production)
INSERT INTO users (username, password, role, full_name) VALUES 
('admin', 'admin123', 'Admin', 'Principal Admin'),
('staff1', 'staff123', 'Staff', 'Department Staff'),
('student1', 'student123', 'Student', 'Sample Student')
ON DUPLICATE KEY UPDATE username=username;


CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NULL, 
    role ENUM('Admin', 'Staff', 'Student') NULL,
    message TEXT NOT NULL,
    type ENUM('APPOINTMENT_BOOKED', 'STATUS_CHANGED') NOT NULL,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
