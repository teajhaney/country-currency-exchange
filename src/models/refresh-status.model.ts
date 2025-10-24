import database from '../common/config/database';
import { StatusResponse } from '../types';
import logger from '../common/utils/logger';

export class RefreshStatusModel {
  async updateStatus(totalCountries: number): Promise<void> {
    try {
      const sql = `
        UPDATE refresh_status SET 
          total_countries = ?,
          last_refreshed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `;
      await database.execute(sql, [totalCountries]);
      logger.info(`Refresh status updated: ${totalCountries} countries`);
    } catch (error) {
      logger.error('Error updating refresh status:', error);
      throw error;
    }
  }

  async getStatus(): Promise<StatusResponse | null> {
    try {
      const sql = 'SELECT * FROM refresh_status WHERE id = 1';
      const result = await database.query<any>(sql);

      if (result.length > 0) {
        const status = result[0];
        return {
          total_countries: status.total_countries,
          last_refreshed_at: status.last_refreshed_at.toISOString(),
        };
      }
      return null;
    } catch (error) {
      logger.error('Error getting refresh status:', error);
      throw error;
    }
  }
}

export default new RefreshStatusModel();
