import type { Response } from 'express';
import logger from './logger';
export function handleError(res: Response, error: any, context: string) {
  // Generic error
  logger.error(`${context} error occurred`, error);
  return res.status(500).json({
    success: false,
    message: `Internal server error: ${error}`,
  });
}
