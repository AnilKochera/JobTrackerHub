import { metrics } from '../metrics';
import { logger } from '../logger';
import { pool } from './pool';

export async function checkDatabaseHealth(): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      metrics.timing('db.health.check.duration', Date.now() - startTime);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Database health check failed', error);
    metrics.increment('db.health.check.failed');
    return false;
  }
}

export async function getDatabaseMetrics() {
  const client = await pool.connect();
  try {
    // Get active connections
    const activeConnectionsResult = await client.query(`
      SELECT count(*) as count 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    
    // Get database size
    const dbSizeResult = await client.query(`
      SELECT pg_database_size(current_database()) as size
    `);

    // Get table statistics
    const tableStatsResult = await client.query(`
      SELECT 
        schemaname,
        relname,
        n_live_tup as row_count,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
    `);

    return {
      activeConnections: parseInt(activeConnectionsResult.rows[0].count),
      databaseSize: parseInt(dbSizeResult.rows[0].size),
      tableStats: tableStatsResult.rows,
    };
  } finally {
    client.release();
  }
}

// Monitor query performance
export async function monitorQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    metrics.timing('db.query.duration', duration, { query: queryName });
    
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        query: queryName,
        duration,
      });
    }
    
    return result;
  } catch (error) {
    metrics.increment('db.query.error', 1, { query: queryName });
    throw error;
  }
}