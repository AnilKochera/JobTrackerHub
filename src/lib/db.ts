import { apiClient } from './apiClient';
import { cache } from './cache';
import { logger } from './logger';
import type { JobApplication } from '../types/application';

export const db = {
  async getAllFromIndex(collection: string, indexName: string, value: string) {
    try {
      const cacheKey = `${collection}:${indexName}:${value}`;
      const cached = await cache.get<JobApplication[]>(cacheKey);
      if (cached) return cached;

      const response = await apiClient.get<JobApplication[]>(`/${collection}?${indexName}=${value}`);
      await cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      logger.error('Database Error', { collection, indexName, value, error });
      throw error;
    }
  },

  async add(collection: string, data: any) {
    try {
      const response = await apiClient.post(`/${collection}`, data);
      await cache.clear();
      return response.data;
    } catch (error) {
      logger.error('Database Error', { collection, operation: 'add', error });
      throw error;
    }
  },

  async get(collection: string, id: string) {
    try {
      const cacheKey = `${collection}:${id}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await apiClient.get(`/${collection}/${id}`);
      await cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      logger.error('Database Error', { collection, id, operation: 'get', error });
      throw error;
    }
  },

  async put(collection: string, data: any) {
    try {
      const response = await apiClient.put(`/${collection}/${data.id}`, data);
      await cache.clear();
      return response.data;
    } catch (error) {
      logger.error('Database Error', { collection, operation: 'put', error });
      throw error;
    }
  },

  async delete(collection: string, id: string) {
    try {
      await apiClient.delete(`/${collection}/${id}`);
      await cache.clear();
    } catch (error) {
      logger.error('Database Error', { collection, id, operation: 'delete', error });
      throw error;
    }
  },
};