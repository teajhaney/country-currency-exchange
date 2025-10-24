import countryModel from '../models/country.model';
import refreshStatusModel from '../models/refresh-status.model';
import externalApiService from './external-api.service';
import imageGeneratorService from './image-generator.service';
import { Country, CountryQueryParams, StatusResponse } from '../types';
import logger from '../common/utils/logger';

export class CountryService {
  async refreshCountries(): Promise<{
    message: string;
    total_countries: number;
  }> {
    try {
      logger.info('Starting countries refresh process...');

      // Fetch and process data from external APIs
      const countriesData = await externalApiService.fetchAndProcessAllData();

      if (countriesData.length === 0) {
        throw new Error('No countries data received from external APIs');
      }

      // Clear existing data and insert new data
      await countryModel.clearAll();

      let successCount = 0;
      for (const countryData of countriesData) {
        try {
          await countryModel.create(countryData);
          successCount++;
        } catch (error) {
          logger.warn(`Failed to save country ${countryData.name}:`, error);
          // Continue with other countries even if one fails
        }
      }

      // Update refresh status
      await refreshStatusModel.updateStatus(successCount);

      // Generate summary image
      try {
        const topCountries = await countryModel.getTopCountriesByGDP(5);
        await imageGeneratorService.generateSummaryImage(
          successCount,
          topCountries,
          new Date()
        );
      } catch (error) {
        logger.error('Failed to generate summary image:', error);
        // Don't fail the entire refresh if image generation fails
      }

      logger.info(
        `Countries refresh completed successfully. ${successCount} countries processed.`
      );

      return {
        message: `Successfully refreshed ${successCount} countries`,
        total_countries: successCount,
      };
    } catch (error) {
      logger.error('Error in refreshCountries:', error);
      throw error;
    }
  }

  async getAllCountries(queryParams?: CountryQueryParams): Promise<Country[]> {
    try {
      return await countryModel.findAll(queryParams);
    } catch (error) {
      logger.error('Error getting all countries:', error);
      throw error;
    }
  }

  async getCountryByName(name: string): Promise<Country | null> {
    try {
      const country = await countryModel.findByName(name);
      if (!country) {
        throw new Error('Country not found');
      }
      return country;
    } catch (error) {
      logger.error('Error getting country by name:', error);
      throw error;
    }
  }

  async deleteCountryByName(name: string): Promise<boolean> {
    try {
      const country = await countryModel.findByName(name);
      if (!country) {
        throw new Error('Country not found');
      }

      const deleted = await countryModel.deleteByName(name);
      if (deleted) {
        // Update refresh status
        const newCount = await countryModel.getCount();
        await refreshStatusModel.updateStatus(newCount);
      }
      return deleted;
    } catch (error) {
      logger.error('Error deleting country:', error);
      throw error;
    }
  }

  async getStatus(): Promise<StatusResponse> {
    try {
      const status = await refreshStatusModel.getStatus();
      if (!status) {
        // Return default status if no record exists
        const totalCountries = await countryModel.getCount();
        return {
          total_countries: totalCountries,
          last_refreshed_at: new Date().toISOString(),
        };
      }
      return status;
    } catch (error) {
      logger.error('Error getting status:', error);
      throw error;
    }
  }

  async getSummaryImage(): Promise<{ imagePath: string }> {
    try {
      if (!imageGeneratorService.summaryImageExists()) {
        throw new Error('Summary image not found');
      }
      return {
        imagePath: imageGeneratorService.getSummaryImagePath(),
      };
    } catch (error) {
      logger.error('Error getting summary image:', error);
      throw error;
    }
  }
}

export default new CountryService();
