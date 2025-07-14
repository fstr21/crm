#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseToken = process.env.SUPABASE_TOKEN;

async function healthCheck() {
  try {
    if (!supabaseUrl || !supabaseToken) {
      throw new Error('Missing environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseToken);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Health check failed: ${error.message}`);
    }
    
    console.log('✅ Supabase MCP Server: Healthy');
    process.exit(0);
  } catch (error) {
    console.error('❌ Supabase MCP Server: Unhealthy -', error.message);
    process.exit(1);
  }
}

healthCheck();