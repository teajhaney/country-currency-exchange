// External API Response Types
export interface CountryAPIResponse {
  name: string;
  capital?: string;
  region: string;
  population: number;
  flag: string;
  currencies?: Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
}

export interface ExchangeRateAPIResponse {
  result: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  conversion_result: number;
}

export interface ExchangeRatesResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

// Database Model Types
export interface Country {
  id?: number;
  name: string;
  capital?: string;
  region?: string;
  population: number;
  currency_code?: string;
  exchange_rate?: number;
  estimated_gdp?: number;
  flag_url?: string;
  last_refreshed_at?: Date;
}

export interface CountryCreateData {
  name: string;
  capital?: string;
  region?: string;
  population: number;
  currency_code?: string;
  exchange_rate?: number;
  estimated_gdp?: number;
  flag_url?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Query Parameters
export interface CountryQueryParams {
  region?: string;
  currency?: string;
  sort?:
    | 'gdp_asc'
    | 'gdp_desc'
    | 'population_asc'
    | 'population_desc'
    | 'name_asc'
    | 'name_desc';
}

export interface StatusResponse {
  total_countries: number;
  last_refreshed_at: string;
}
