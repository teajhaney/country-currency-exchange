# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with exchange rate calculations.

## Features

- Fetch country data from REST Countries API
- Fetch exchange rates from Open Exchange Rates API
- Calculate estimated GDP using population and exchange rates
- Store and cache data in MySQL database
- Generate summary images with statistics
- Full CRUD operations for countries
- Filtering and sorting capabilities
- Comprehensive error handling and validation

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd country-currency-exchange
```

2. Install dependencies:

```bash
npm install
```

3. Create a MySQL database:

```sql
-- Option 1: Use the provided setup script
mysql -u root -p < setup-db.sql

-- Option 2: Create manually
mysql -u root -p
CREATE DATABASE country_currency_db;
```

4. Copy the environment file and configure it:

```bash
cp env.example .env
```

5. Update the `.env` file with your database credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=country_currency_db
DB_USER=your_username
DB_PASSWORD=your_password

# External APIs (optional - defaults are provided)
COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_API_URL=https://open.er-api.com/v6/latest/USD
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Countries

#### POST /countries/refresh

Fetch all countries and exchange rates, then cache them in the database.

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Successfully refreshed 250 countries",
    "total_countries": 250
  }
}
```

#### GET /countries

Get all countries from the database with optional filtering and sorting.

**Query Parameters:**

- `region` (optional): Filter by region (e.g., `?region=Africa`)
- `currency` (optional): Filter by currency code (e.g., `?currency=NGN`)
- `sort` (optional): Sort by field (e.g., `?sort=gdp_desc`)

**Available sort options:**

- `gdp_asc` - Sort by estimated GDP ascending
- `gdp_desc` - Sort by estimated GDP descending
- `population_asc` - Sort by population ascending
- `population_desc` - Sort by population descending
- `name_asc` - Sort by name ascending
- `name_desc` - Sort by name descending

**Example Response:**

```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-01-22T18:00:00Z"
  }
]
```

#### GET /countries/:name

Get a specific country by name.

**Example:** `GET /countries/Nigeria`

#### DELETE /countries/:name

Delete a country record by name.

**Example:** `DELETE /countries/Nigeria`

#### GET /countries/image

Serve the generated summary image.

### Status

#### GET /status

Get system status including total countries and last refresh timestamp.

**Response:**

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-01-22T18:00:00Z"
}
```

### Health Check

#### GET /health

Check if the server is running.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-01-22T18:00:00Z"
}
```

## Data Model

### Country Fields

- `id` - Auto-generated primary key
- `name` - Country name (required)
- `capital` - Capital city (optional)
- `region` - Geographic region (optional)
- `population` - Population count (required)
- `currency_code` - Currency code (e.g., NGN, USD) (optional)
- `exchange_rate` - Exchange rate against USD (optional)
- `estimated_gdp` - Calculated estimated GDP (optional)
- `flag_url` - URL to country flag image (optional)
- `last_refreshed_at` - Timestamp of last data refresh

### GDP Calculation

The estimated GDP is calculated using the formula:

```
estimated_gdp = (population × random(1000–2000)) ÷ exchange_rate
```

Where:

- `population` is the country's population
- `random(1000–2000)` is a random multiplier between 1000 and 2000
- `exchange_rate` is the currency's exchange rate against USD

## Error Handling

The API returns consistent JSON error responses:

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": {
    "field_name": "error message"
  }
}
```

### 404 Not Found

```json
{
  "error": "Country not found"
}
```

### 503 Service Unavailable

```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from [API name]"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Database Schema

The application automatically creates the following tables:

### countries

```sql
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capital VARCHAR(255),
  region VARCHAR(255),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(15, 6),
  estimated_gdp DECIMAL(20, 2),
  flag_url TEXT,
  last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### refresh_status

```sql
CREATE TABLE refresh_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_countries INT DEFAULT 0,
  last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Testing

You can test the API using curl or any HTTP client:

### Refresh Countries Data

```bash
curl -X POST http://localhost:3000/countries/refresh
```

### Get All Countries

```bash
curl http://localhost:3000/countries
```

### Get Countries by Region

```bash
curl "http://localhost:3000/countries?region=Africa"
```

### Get Countries Sorted by GDP

```bash
curl "http://localhost:3000/countries?sort=gdp_desc"
```

### Get Specific Country

```bash
curl http://localhost:3000/countries/Nigeria
```

### Get Status

```bash
curl http://localhost:3000/status
```

## Project Structure

```
src/
├── common/
│   ├── config/
│   │   ├── database.ts
│   │   └── index.ts
│   └── utils/
│       ├── app.error.ts
│       ├── async.handler.ts
│       ├── handle.error.ts
│       ├── logger.ts
│       └── validation.ts
├── controllers/
│   └── country.controller.ts
├── middleware/
│   ├── error.hnadler.ts
│   └── not.found.handler.ts
├── models/
│   ├── country.model.ts
│   └── refresh-status.model.ts
├── routes/
│   ├── country.routes.ts
│   └── status.routes.ts
├── services/
│   ├── country.service.ts
│   ├── external-api.service.ts
│   └── image-generator.service.ts
├── types/
│   └── index.ts
└── server.ts
```

## Dependencies

### Production Dependencies

- `express` - Web framework
- `mysql2` - MySQL database driver
- `axios` - HTTP client for external API calls
- `canvas` - Image generation
- `joi` - Data validation
- `cors` - Cross-origin resource sharing
- `helmet` - Security middleware
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variable management
- `winston` - Logging

### Development Dependencies

- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server
- `@types/*` - TypeScript type definitions

## Deployment

This application can be deployed to various platforms. Make sure to:

1. Set up a MySQL database
2. Configure environment variables
3. Install dependencies
4. Build the application
5. Start the server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
