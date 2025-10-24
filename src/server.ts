import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { PORT } from './common/config';
import database from './common/config/database';
import errorHandler from './middleware/error.hnadler';
import { notFoundHandler } from './middleware/not.found.handler';
import countryRoutes from './routes/country.routes';
import statusRoutes from './routes/status.routes';
import logger from './common/utils/logger';

const app: Application = express();

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//rate limitng
const endpointRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests',
    });
  },
});

app.use(endpointRateLimit);

// Routes
app.use('/status', statusRoutes);
app.use('/countries', countryRoutes);

// Serve static files from cache directory
app.use('/cache', express.static(path.join(process.cwd(), 'cache')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

//Error handler
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const isConnected = await database.testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize database tables
    await database.initializeTables();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      logger.info(`Server started successfully on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
