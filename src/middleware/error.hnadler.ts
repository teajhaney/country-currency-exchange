import { ErrorRequestHandler } from 'express';
import logger from '../common/utils/logger';
import { AppError } from '../common/utils/app.error';
import { ApiResponse } from '../types';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    logger.error('AppError:', err.message);
    const response: ApiResponse = {
      error: err.message,
    };
    return res.status(err.statusCode).json(response);
  }

  // Handle specific error messages
  if (err.message === 'Country not found') {
    const response: ApiResponse = {
      error: 'Country not found',
    };
    return res.status(404).json(response);
  }

  if (
    err.message.includes('External data source unavailable') ||
    err.message.includes('timeout') ||
    err.message.includes('service unavailable')
  ) {
    const response: ApiResponse = {
      error: 'External data source unavailable',
      details: err.message,
    };
    return res.status(503).json(response);
  }

  if (err.message === 'Summary image not found') {
    const response: ApiResponse = {
      error: 'Summary image not found',
    };
    return res.status(404).json(response);
  }

  logger.error('Unexpected Error:', err.stack || err);
  const response: ApiResponse = {
    error: 'Internal server error',
  };
  return res.status(500).json(response);
};

export default errorHandler;
