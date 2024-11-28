import { logger } from './logger';
import { checkRateLimit } from './rateLimit';
import { verifyToken } from './auth';

const API_BASE_URL = process.env.API_URL || '/api';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    logger.error('API Error', { status: response.status, error });
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token } = options;

  if (token) {
    try {
      await verifyToken(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Rate limiting check
  const rateLimitKey = `${endpoint}:${token || 'anonymous'}`;
  const canProceed = await checkRateLimit(rateLimitKey);
  if (!canProceed) {
    throw new Error('Too many requests');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse(response);
  } catch (error) {
    logger.error('API Request Failed', { endpoint, error });
    throw new Error('Network error');
  }
}