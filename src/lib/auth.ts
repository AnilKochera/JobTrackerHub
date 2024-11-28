import { SignJWT, jwtVerify } from 'jose';
import { User, UserCredentials, AuthResponse, RegisterCredentials } from '../types/user';
import { apiClient } from './apiClient';
import { logger } from './logger';
import { hashData } from './crypto';

const JWT_SECRET = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET || 'your-secret-key');

export async function login(credentials: UserCredentials): Promise<AuthResponse> {
  try {
    const hashedPassword = await hashData(credentials.password);
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      ...credentials,
      password: hashedPassword
    });
    return response.data;
  } catch (error: any) {
    logger.error('Login failed', { error });
    throw new Error(error.data?.message || 'Invalid email or password');
  }
}

export async function register(data: RegisterCredentials): Promise<AuthResponse> {
  try {
    const hashedPassword = await hashData(data.password);
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      ...data,
      password: hashedPassword
    });
    return response.data;
  } catch (error: any) {
    logger.error('Registration failed', { error });
    if (error.status === 409) {
      throw new Error('Email already exists');
    }
    throw new Error(error.data?.message || 'Registration failed. Please try again.');
  }
}

export async function verifySecurityAnswer(email: string, securityAnswer: string): Promise<void> {
  try {
    const hashedAnswer = await hashData(securityAnswer);
    const response = await apiClient.post('/auth/verify-security', { 
      email, 
      securityAnswer: hashedAnswer 
    });
    if (response.status !== 200) {
      throw new Error('Invalid email or security answer');
    }
  } catch (error: any) {
    logger.error('Security verification failed', { error });
    throw new Error(error.data?.message || 'Invalid email or security answer');
  }
}

export async function resetPassword(email: string, securityAnswer: string, newPassword: string): Promise<void> {
  try {
    const hashedAnswer = await hashData(securityAnswer);
    const hashedPassword = await hashData(newPassword);
    const response = await apiClient.post('/auth/reset-password', {
      email,
      securityAnswer: hashedAnswer,
      newPassword: hashedPassword,
    });
    if (response.status !== 200) {
      throw new Error('Failed to reset password');
    }
  } catch (error: any) {
    logger.error('Password reset failed', { error });
    throw new Error(error.data?.message || 'Failed to reset password. Please try again.');
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}