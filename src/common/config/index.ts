import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Database Configuration
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'country_currency_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: false,
  },
};

// External API URLs
export const COUNTRIES_API_URL =
  process.env.COUNTRIES_API_URL ||
  'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
export const EXCHANGE_API_URL =
  process.env.EXCHANGE_API_URL || 'https://open.er-api.com/v6/latest/USD';
