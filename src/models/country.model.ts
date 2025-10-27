import database from '../common/config/database';
import { Country, CountryCreateData, CountryQueryParams } from '../types';
import logger from '../common/utils/logger';

export class CountryModel {
  async create(countryData: CountryCreateData): Promise<Country> {
    try {
      const {
        name,
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url,
      } = countryData;

      const sql = `
        INSERT INTO countries (
          name, capital, region, population, currency_code, 
          exchange_rate, estimated_gdp, flag_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await database.execute(sql, [
        name,
        capital || null,
        region || null,
        population,
        currency_code || null,
        exchange_rate || null,
        estimated_gdp || null,
        flag_url || null,
      ]);

      const createdCountry = await this.findById(result.insertId);
      if (!createdCountry) {
        throw new Error('Failed to retrieve created country');
      }
      return createdCountry;
    } catch (error) {
      logger.error('Error creating country:', error);
      throw error;
    }
  }
  async bulkCreate(countriesData: CountryCreateData[]): Promise<void> {
    if (countriesData.length === 0) {
      logger.info('No countries to bulk insert');
      return;
    }

    try {
      // Build placeholders: (?, ?, ?, ...) repeated
      const placeholders = countriesData
        .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)') // 9 fields: name,capital,region,pop,curr,rate,gdp,flag,timestamp
        .join(', ');

      // Flatten values array
      const now = new Date(); // Single timestamp for all (or per-country if needed)
      const values: any[] = countriesData.flatMap(d => [
        d.name,
        d.capital || null,
        d.region || null,
        d.population,
        d.currency_code || null,
        d.exchange_rate || null,
        d.estimated_gdp || null,
        d.flag_url || null,
        now, // last_refreshed_at
      ]);

      const sql = `
      INSERT INTO countries (
        name, capital, region, population, currency_code, 
        exchange_rate, estimated_gdp, flag_url, last_refreshed_at
      ) VALUES ${placeholders}
    `;

      const result = await database.execute(sql, values);
      logger.info(
        `Bulk inserted ${countriesData.length} countries (affected: ${result.affectedRows})`
      );
    } catch (error) {
      logger.error('Error in bulkCreate:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Country | null> {
    try {
      const sql = 'SELECT * FROM countries WHERE id = ?';
      const result = await database.query<Country>(sql, [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Error finding country by ID:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Country | null> {
    try {
      const sql = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)';
      const result = await database.query<Country>(sql, [name]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Error finding country by name:', error);
      throw error;
    }
  }

  async findAll(queryParams?: CountryQueryParams): Promise<Country[]> {
    try {
      let sql = 'SELECT * FROM countries WHERE 1=1';
      const params: any[] = [];

      if (queryParams?.region) {
        sql += ' AND region = ?';
        params.push(queryParams.region);
      }

      if (queryParams?.currency) {
        sql += ' AND currency_code = ?';
        params.push(queryParams.currency);
      }

      // Add sorting
      if (queryParams?.sort) {
        switch (queryParams.sort) {
          case 'gdp_desc':
            sql += ' ORDER BY estimated_gdp DESC';
            break;
          case 'gdp_asc':
            sql += ' ORDER BY estimated_gdp ASC';
            break;
          case 'population_desc':
            sql += ' ORDER BY population DESC';
            break;
          case 'population_asc':
            sql += ' ORDER BY population ASC';
            break;
          case 'name_asc':
            sql += ' ORDER BY name ASC';
            break;
          case 'name_desc':
            sql += ' ORDER BY name DESC';
            break;
          default:
            sql += ' ORDER BY name ASC';
        }
      } else {
        sql += ' ORDER BY name ASC';
      }

      return await database.query<Country>(sql, params);
    } catch (error) {
      logger.error('Error finding all countries:', error);
      throw error;
    }
  }

  async updateByName(
    name: string,
    countryData: CountryCreateData
  ): Promise<Country | null> {
    try {
      const {
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url,
      } = countryData;

      const sql = `
        UPDATE countries SET
          capital = ?,
          region = ?,
          population = ?,
          currency_code = ?,
          exchange_rate = ?,
          estimated_gdp = ?,
          flag_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(name) = LOWER(?)
      `;

      const result = await database.execute(sql, [
        capital || null,
        region || null,
        population,
        currency_code || null,
        exchange_rate || null,
        estimated_gdp || null,
        flag_url || null,
        name,
      ]);

      if (result.affectedRows > 0) {
        return this.findByName(name);
      }
      return null;
    } catch (error) {
      logger.error('Error updating country:', error);
      throw error;
    }
  }

  async upsert(countryData: CountryCreateData): Promise<Country> {
    try {
      const existingCountry = await this.findByName(countryData.name);

      if (existingCountry) {
        const updated = await this.updateByName(countryData.name, countryData);
        return updated!;
      } else {
        return await this.create(countryData);
      }
    } catch (error) {
      logger.error('Error upserting country:', error);
      throw error;
    }
  }

  async deleteByName(name: string): Promise<boolean> {
    try {
      const sql = 'DELETE FROM countries WHERE LOWER(name) = LOWER(?)';
      const result = await database.execute(sql, [name]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting country:', error);
      throw error;
    }
  }

  async getCount(): Promise<number> {
    try {
      const sql = 'SELECT COUNT(*) as count FROM countries';
      const result = await database.query<{ count: number }>(sql);
      return result[0].count;
    } catch (error) {
      logger.error('Error getting country count:', error);
      throw error;
    }
  }

  async getTopCountriesByGDP(limit: number = 5): Promise<Country[]> {
    try {
      const sql = `
        SELECT * FROM countries 
        WHERE estimated_gdp IS NOT NULL 
        ORDER BY estimated_gdp DESC 
        LIMIT ?
      `;
      return await database.query<Country>(sql, [limit]);
    } catch (error) {
      logger.error('Error getting top countries by GDP:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await database.execute('DELETE FROM countries');
      logger.info('All countries cleared from database');
    } catch (error) {
      logger.error('Error clearing all countries:', error);
      throw error;
    }
  }
}

export default new CountryModel();
