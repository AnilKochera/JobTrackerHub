import { randomBytes, createHash } from 'crypto';

export function generateRandomToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function hashData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}