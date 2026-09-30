import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: 3000,
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'curevia_super_secret_jwt_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'curevia_refresh_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRATION || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
  mockOtp: process.env.MOCK_OTP !== 'false', // Default true for safe dev mode
  defaultOtpDev: '123456',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/curevia?schema=public',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  storageBucket: process.env.STORAGE_BUCKET || 'curevia-ehr-vault',
  storageRegion: process.env.STORAGE_REGION || 'ap-south-1',
};
