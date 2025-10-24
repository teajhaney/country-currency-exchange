import { Request, Response, NextFunction } from 'express';
import countryService from '../services/country.service';
import { ApiResponse, CountryQueryParams } from '../types';
import logger from '../common/utils/logger';

export class CountryController {
  async refreshCountries(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await countryService.refreshCountries();

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error in refreshCountries controller:', error);
      next(error);
    }
  }

  async getAllCountries(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryParams: CountryQueryParams = {
        region: req.query.region as string,
        currency: req.query.currency as string,
        sort: req.query.sort as any,
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof CountryQueryParams] === undefined) {
          delete queryParams[key as keyof CountryQueryParams];
        }
      });

      const countries = await countryService.getAllCountries(queryParams);

      res.status(200).json(countries);
    } catch (error) {
      logger.error('Error in getAllCountries controller:', error);
      next(error);
    }
  }

  async getCountryByName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name } = req.params;
      const country = await countryService.getCountryByName(name);

      res.status(200).json(country);
    } catch (error) {
      logger.error('Error in getCountryByName controller:', error);
      next(error);
    }
  }

  async deleteCountryByName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name } = req.params;
      const deleted = await countryService.deleteCountryByName(name);

      if (deleted) {
        res
          .status(200)
          .json({ message: `Country ${name} deleted successfully` });
      } else {
        res.status(404).json({ error: 'Country not found' });
      }
    } catch (error) {
      logger.error('Error in deleteCountryByName controller:', error);
      next(error);
    }
  }

  async getStatus(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const status = await countryService.getStatus();

      res.status(200).json(status);
    } catch (error) {
      logger.error('Error in getStatus controller:', error);
      next(error);
    }
  }

  async getSummaryImage(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await countryService.getSummaryImage();

      res.sendFile(result.imagePath);
    } catch (error) {
      logger.error('Error in getSummaryImage controller:', error);
      next(error);
    }
  }
}

export default new CountryController();
