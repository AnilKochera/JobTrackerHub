import { apiClient } from '../apiClient';
import { logger } from '../logger';

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    if (response.status !== 200) {
      throw new Error('Failed to send reset email');
    }
  } catch (error: any) {
    logger.error('Password reset request failed', { error });
    if (error.status === 429) {
      throw new Error('Too many attempts. Please try again later.');
    }
    throw new Error('Failed to send reset email. Please try again.');
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  try {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    if (response.status !== 200) {
      throw new Error('Failed to reset password');
    }
  } catch (error: any) {
    logger.error('Password reset failed', { error });
    if (error.status === 400) {
      throw new Error('Invalid or expired reset link. Please request a new one.');
    }
    throw new Error('Failed to reset password. Please try again.');
  }
}