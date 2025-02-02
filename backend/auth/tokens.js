import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config.js';

export const generateTokens = (user) => {
  try {
    const accessToken = jwt.sign(
      { username: user.username },
      jwtConfig.secret,
      { expiresIn: jwtConfig.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { username: user.username },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error generating tokens:', error);
    throw new Error('Failed to generate authentication tokens');
  }
};