import axios from 'axios';
import {
  CountryAPIResponse,
  ExchangeRatesResponse,
  CountryCreateData,
} from '../types';
import { COUNTRIES_API_URL, EXCHANGE_API_URL } from '../common/config';
import logger from '../common/utils/logger';

export class ExternalAPIService {
  private countriesApiUrl: string;
  private exchangeApiUrl: string;

  constructor() {
    this.countriesApiUrl = COUNTRIES_API_URL;
    this.exchangeApiUrl = EXCHANGE_API_URL;
  }

  async fetchCountries(): Promise<CountryAPIResponse[]> {
    try {
      logger.info('Fetching countries from external API...');
      const response = await axios.get<CountryAPIResponse[]>(
        this.countriesApiUrl,
        {
          timeout: 60000, // 30 seconds timeout
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from countries API');
      }

      logger.info(`Successfully fetched ${response.data.length} countries`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching countries:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Countries API request timeout');
        }
        if (error.response?.status === 503) {
          throw new Error('Countries API service unavailable');
        }
      }
      throw new Error('Failed to fetch countries data');
    }
  }

  async fetchExchangeRates(): Promise<ExchangeRatesResponse> {
    try {
      logger.info('Fetching exchange rates from external API...');
      const response = await axios.get<ExchangeRatesResponse>(
        this.exchangeApiUrl,
        {
          timeout: 60000, // 30 seconds timeout
        }
      );

      if (!response.data.rates || typeof response.data.rates !== 'object') {
        throw new Error('Invalid response format from exchange rates API');
      }

      logger.info(
        `Successfully fetched exchange rates for ${
          Object.keys(response.data.rates).length
        } currencies`
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching exchange rates:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Exchange rates API request timeout');
        }
        if (error.response?.status === 503) {
          throw new Error('Exchange rates API service unavailable');
        }
      }
      throw new Error('Failed to fetch exchange rates data');
    }
  }

  processCountriesData(
    countries: CountryAPIResponse[],
    exchangeRates: Record<string, number>
  ): CountryCreateData[] {
    logger.info('Processing countries data with exchange rates...');

    return countries.map(country => {
      // Extract currency code (first currency if multiple)
      let currencyCode: string | undefined;
      if (country.currencies && country.currencies.length > 0) {
        currencyCode = country.currencies[0].code;
      }

      // Get exchange rate
      let exchangeRate: number | undefined;
      if (currencyCode && exchangeRates[currencyCode]) {
        exchangeRate = exchangeRates[currencyCode];
      }

      // Calculate estimated GDP
      let estimatedGDP: number | undefined;
      if (currencyCode && exchangeRate) {
        // Generate random multiplier between 1000-2000
        const randomMultiplier = Math.random() * 1000 + 1000;
        estimatedGDP = (country.population * randomMultiplier) / exchangeRate;
      } else if (!currencyCode) {
        // If no currency, set GDP to 0
        estimatedGDP = 0;
      }

      return {
        name: country.name,
        capital: country.capital,
        region: country.region,
        population: country.population,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        estimated_gdp: estimatedGDP,
        flag_url: country.flag,
      };
    });
  }

  async fetchAndProcessAllData(): Promise<CountryCreateData[]> {
    try {
      logger.info('Starting to fetch and process all external data...');

      // Fetch both APIs in parallel
      const [countriesData, exchangeRatesData] = await Promise.all([
        this.fetchCountries(),
        this.fetchExchangeRates(),
      ]);

      // Process the data
      const processedData = this.processCountriesData(
        countriesData,
        exchangeRatesData.rates
      );

      logger.info(`Successfully processed ${processedData.length} countries`);
      return processedData;
    } catch (error) {
      logger.error('Error in fetchAndProcessAllData:', error);
      throw error;
    }
  }
}

export default new ExternalAPIService();
