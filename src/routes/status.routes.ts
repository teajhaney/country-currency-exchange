import { Router } from 'express';
import countryController from '../controllers/country.controller';

const router = Router();

// GET /status - Show total countries and last refresh timestamp
router.get('/', countryController.getStatus);

export default router;
