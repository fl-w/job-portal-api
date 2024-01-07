import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 8080,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  saltRounds: process.env.BCRPYT_SALT_ROUNDS || 14,
};
