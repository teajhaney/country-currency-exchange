import { Router } from 'express';
import countryController from '../controllers/country.controller';
import {
  validateRequest,
  countryQuerySchema,
  countryParamsSchema,
} from '../common/utils/validation';

const router = Router();

//1 POST /countries/refresh - Fetch all countries and exchange rates, then cache them in the database
router.post(
  '/refresh',
  validateRequest({}),
  countryController.refreshCountries
);

//2 GET /countries - Get all countries from the DB (support filters and sorting)
router.get(
  '/',
  validateRequest({ query: countryQuerySchema }),
  countryController.getAllCountries
);
//3 GET /countries/image - Serve summary image
router.get('/image', countryController.getSummaryImage);


//4 GET /countries/:name - Get one country by name
router.get(
  '/:name',
  validateRequest({ params: countryParamsSchema }),
  countryController.getCountryByName
);

//5 DELETE /countries/:name - Delete a country record
router.delete(
  '/:name',
  validateRequest({ params: countryParamsSchema }),
  countryController.deleteCountryByName
);


export default router;
