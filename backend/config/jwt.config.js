import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET'];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Error: ${varName} is not set in environment variables`);
    process.exit(1);  // Exit if required variables are missing
  }
});

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: '45m',
  refreshTokenExpiry: '7d'
};
