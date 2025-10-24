-- Database setup script for Country Currency Exchange API
-- Run this script to create the database

CREATE DATABASE IF NOT EXISTS country_currency_db;
USE country_currency_db;

-- The application will automatically create the tables when it starts
-- This script just ensures the database exists

-- Optional: Create a dedicated user for the application
-- CREATE USER 'country_api_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON country_currency_db.* TO 'country_api_user'@'localhost';
-- FLUSH PRIVILEGES;
