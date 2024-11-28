import { pool } from './pool';
import { monitorQuery } from './monitor';
import { logger } from '../logger';

export const queries = {
  async getUserStats() {
    return monitorQuery('get_user_stats', async () => {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_24h,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d
        FROM users
      `);
      return result.rows[0];
    });
  },

  async getApplicationStats(userId: string) {
    return monitorQuery('get_application_stats', async () => {
      const result = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::numeric(10,2) as avg_days_to_response
        FROM job_applications
        WHERE user_id = $1
        GROUP BY status
      `, [userId]);
      return result.rows;
    });
  },

  async getLocationStats() {
    return monitorQuery('get_location_stats', async () => {
      const result = await pool.query(`
        SELECT 
          location,
          COUNT(*) as application_count,
          COUNT(DISTINCT user_id) as unique_applicants
        FROM job_applications
        GROUP BY location
        ORDER BY application_count DESC
        LIMIT 10
      `);
      return result.rows;
    });
  },

  async getSuccessRateByCompany() {
    return monitorQuery('get_success_rate_by_company', async () => {
      const result = await pool.query(`
        SELECT 
          company,
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status IN ('offered', 'accepted') THEN 1 END) as successful_applications,
          ROUND(COUNT(CASE WHEN status IN ('offered', 'accepted') THEN 1 END)::numeric / COUNT(*) * 100, 2) as success_rate
        FROM job_applications
        GROUP BY company
        HAVING COUNT(*) >= 5
        ORDER BY success_rate DESC
        LIMIT 10
      `);
      return result.rows;
    });
  }
};