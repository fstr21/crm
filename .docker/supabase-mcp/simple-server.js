#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseToken = process.env.SUPABASE_TOKEN;

if (!supabaseUrl || !supabaseToken) {
  console.error('❌ Missing environment variables: SUPABASE_URL or SUPABASE_TOKEN');
  process.exit(1);
}

// Simple MCP-like server using stdio
class SimpleSupabaseMCPServer {
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseToken);
    this.setupStdio();
  }

  setupStdio() {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      try {
        const request = JSON.parse(data.trim());
        this.handleRequest(request);
      } catch (error) {
        this.sendError('Invalid JSON request');
      }
    });
  }

  async handleRequest(request) {
    const { id, method, params } = request;

    try {
      let result;

      switch (method) {
        case 'tools/list':
          result = await this.listTools();
          break;
        case 'tools/call':
          result = await this.callTool(params);
          break;
        case 'initialize':
          result = await this.initialize();
          break;
        default:
          throw new Error(`Unknown method: ${method}`);
      }

      this.sendResponse(id, result);
    } catch (error) {
      this.sendError(error.message, id);
    }
  }

  async initialize() {
    // Test Supabase connection
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }

      return {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'supabase-mcp-server',
          version: '1.0.0'
        }
      };
    } catch (error) {
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async listTools() {
    return {
      tools: [
        {
          name: 'test_connection',
          description: 'Test Supabase connection and show basic info',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'query_table',
          description: 'Query any table in the database',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string', description: 'Table name to query' },
              limit: { type: 'number', description: 'Number of records to return', default: 10 }
            },
            required: ['table']
          }
        },
        {
          name: 'list_tables',
          description: 'List all tables in the public schema',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'create_test_table',
          description: 'Create a test table to verify write access',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name for the test table', default: 'mcp_test' }
            },
            required: []
          }
        },
        {
          name: 'insert_test_data',
          description: 'Insert test data into a table',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string', description: 'Table name' },
              data: { type: 'object', description: 'Data to insert' }
            },
            required: ['table', 'data']
          }
        }
      ]
    };
  }

  async callTool(params) {
    const { name, arguments: args } = params;

    switch (name) {
      case 'test_connection':
        return await this.testConnection();
      case 'query_table':
        return await this.queryTable(args);
      case 'list_tables':
        return await this.listTables();
      case 'create_test_table':
        return await this.createTestTable(args);
      case 'insert_test_data':
        return await this.insertTestData(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async testConnection() {
    try {
      // Test basic connection
      const { data, error } = await this.supabase
        .from('information_schema.schemata')
        .select('schema_name')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Connection test failed: ${error.message}`);
      }

      // Test auth
      let authStatus = 'Service key mode';
      try {
        const { data: { user }, error: authError } = await this.supabase.auth.getUser();
        if (!authError && user) {
          authStatus = `Authenticated as ${user.email}`;
        }
      } catch (e) {
        // Expected for service key
      }

      // Test storage
      let storageStatus = 'Not accessible';
      try {
        const { data: buckets, error: storageError } = await this.supabase.storage.listBuckets();
        if (!storageError) {
          storageStatus = `${buckets.length} buckets available`;
        }
      } catch (e) {
        storageStatus = 'Limited access';
      }

      const result = {
        connection: '✅ Connected successfully',
        authentication: authStatus,
        storage: storageStatus,
        url: supabaseUrl,
        timestamp: new Date().toISOString()
      };

      return {
        content: [
          {
            type: 'text',
            text: `Supabase Connection Test Results:\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  async queryTable(args) {
    const { table, limit = 10 } = args;

    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .limit(limit);

      if (error) {
        throw new Error(`Query failed: ${error.message}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Query results from table '${table}' (limit ${limit}):\n\n${JSON.stringify(data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to query table '${table}': ${error.message}`);
    }
  }

  async listTables() {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public');

      if (error) {
        throw new Error(`Failed to list tables: ${error.message}`);
      }

      const tables = data || [];
      
      return {
        content: [
          {
            type: 'text',
            text: `Tables in public schema (${tables.length} found):\n\n${JSON.stringify(tables, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to list tables: ${error.message}`);
    }
  }

  async createTestTable(args) {
    const { tableName = 'mcp_test' } = args;

    try {
      // Try to create a simple test table
      const createSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // Note: This might not work with service keys depending on permissions
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql_query: createSQL 
      });

      if (error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ Table creation may require admin privileges.\n\nTo create the table manually, run this SQL in Supabase Dashboard:\n\n${createSQL}\n\nError: ${error.message}`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Test table '${tableName}' created successfully!`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ Direct table creation failed: ${error.message}\n\nYou may need to create tables manually in the Supabase Dashboard.`
          }
        ]
      };
    }
  }

  async insertTestData(args) {
    const { table, data } = args;

    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select();

      if (error) {
        throw new Error(`Insert failed: ${error.message}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Data inserted successfully into '${table}':\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to insert data into '${table}': ${error.message}`);
    }
  }

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    };
    console.log(JSON.stringify(response));
  }

  sendError(message, id = null) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code: -1,
        message
      }
    };
    console.log(JSON.stringify(response));
  }
}

// Start the server
console.error('🚀 Starting Simple Supabase MCP Server...');
console.error(`📡 Supabase URL: ${supabaseUrl}`);
console.error(`🔑 Token: ${supabaseToken.substring(0, 10)}...`);
console.error('📝 Ready for requests via stdin/stdout');

new SimpleSupabaseMCPServer();