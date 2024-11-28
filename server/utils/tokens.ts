import { SignJWT } from 'jose';
import { generateRandomToken } from './crypto';
import { logger } from './logger';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || generateRandomToken()
);

export async function generateResetToken(userId: string): Promise<string> {
  try {
    const token = await new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(JWT_SECRET);

    logger.info('Reset token generated', { userId });
    return token;
  } catch (error) {
    logger.error('Failed to generate reset token', { error, userId });
    throw new Error('Failed to generate reset token');
  }
}

export async function verifyToken(token: string) {
  try {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    logger.error('Failed to verify token', { error });
    throw new Error('Invalid or expired token');
  }
}