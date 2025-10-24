import mysql from 'mysql2/promise';
import { DB_CONFIG } from './index';
import logger from '../utils/logger';

class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    try {
      const [result] = await this.pool.execute(sql, params);
      return result as mysql.ResultSetHeader;
    } catch (error) {
      logger.error('Database execute error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.execute('SELECT 1');
      logger.info('Database connection successful');
      return true;
    } catch (error) {
      logger.error('Database connection failed:', error);
      return false;
    }
  }

  async initializeTables(): Promise<void> {
    try {
      const createCountriesTable = `
        CREATE TABLE IF NOT EXISTS countries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          capital VARCHAR(255),
          region VARCHAR(255),
          population BIGINT NOT NULL,
          currency_code VARCHAR(10),
          exchange_rate DECIMAL(15, 6),
          estimated_gdp DECIMAL(20, 2),
          flag_url TEXT,
          last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_region (region),
          INDEX idx_currency_code (currency_code),
          INDEX idx_population (population),
          INDEX idx_estimated_gdp (estimated_gdp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      const createStatusTable = `
        CREATE TABLE IF NOT EXISTS refresh_status (
          id INT AUTO_INCREMENT PRIMARY KEY,
          total_countries INT DEFAULT 0,
          last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      await this.execute(createCountriesTable);
      await this.execute(createStatusTable);

      // Initialize status table if empty
      const statusExists = await this.query(
        'SELECT COUNT(*) as count FROM refresh_status'
      );
      if (statusExists[0].count === 0) {
        await this.execute(
          'INSERT INTO refresh_status (total_countries) VALUES (0)'
        );
      }

      logger.info('Database tables initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database tables:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export default new DatabaseService();
