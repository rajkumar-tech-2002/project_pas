-- SQL Migration to add commitment columns to availability_windows
USE PAS;

-- Add status column if it doesn't exist
ALTER TABLE availability_windows 
ADD COLUMN IF NOT EXISTS status ENUM('available', 'busy') DEFAULT 'available' AFTER end_time;

-- Add title column if it doesn't exist
ALTER TABLE availability_windows 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NULL AFTER status;
