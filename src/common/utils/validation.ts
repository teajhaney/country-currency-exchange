import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {};

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        error.details.forEach(detail => {
          errors[detail.path.join('.')] = detail.message;
        });
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        error.details.forEach(detail => {
          errors[detail.path.join('.')] = detail.message;
        });
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        error.details.forEach(detail => {
          errors[detail.path.join('.')] = detail.message;
        });
      }
    }

    if (Object.keys(errors).length > 0) {
      const response: ApiResponse = {
        error: 'Validation failed',
        details: errors,
      };
      res.status(400).json(response);
      return;
    }

    next();
  };
};

// Validation schemas
export const countryQuerySchema = Joi.object({
  region: Joi.string().optional(),
  currency: Joi.string().optional(),
  sort: Joi.string()
    .valid(
      'gdp_asc',
      'gdp_desc',
      'population_asc',
      'population_desc',
      'name_asc',
      'name_desc'
    )
    .optional(),
});

export const countryParamsSchema = Joi.object({
  name: Joi.string().required(),
});

export const refreshCountriesSchema = Joi.object({
  // No body validation needed for refresh endpoint
});
