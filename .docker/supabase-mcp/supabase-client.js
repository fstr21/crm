import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

class SupabaseClient {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Missing required Supabase configuration');
    }

    // Client for general operations
    this.client = createClient(this.supabaseUrl, this.supabaseAnonKey);
    
    // Admin client for service operations
    this.adminClient = this.supabaseServiceKey 
      ? createClient(this.supabaseUrl, this.supabaseServiceKey)
      : this.client;

    logger.info('Supabase clients initialized');
  }

  async testConnection() {
    try {
      // Test basic connection
      const { data, error } = await this.client
        .from('_realtime_schema_version')
        .select('*')
        .limit(1);

      if (error && !error.message.includes('relation "_realtime_schema_version" does not exist')) {
        throw error;
      }

      logger.info('Supabase connection test successful');
      return true;
    } catch (error) {
      logger.error('Supabase connection test failed:', error);
      return false;
    }
  }

  getClient(useAdmin = false) {
    return useAdmin ? this.adminClient : this.client;
  }
}

export default SupabaseClient;