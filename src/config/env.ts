interface EnvConfig {
  API_BASE_URL: string;
  ENVIRONMENT: string;
  APP_NAME: string;
  VERSION: string;
  APP_VERSION: string;
}

export const env: EnvConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  ENVIRONMENT: (import.meta.env.VITE_ENVIRONMENT as string) || 'development',
  APP_NAME: 'Pharma Forms Suite',
  VERSION: '1.0.0',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

export default env;