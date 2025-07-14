#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SchemaFixer {
  constructor() {
    this.requestId = 1;
    this.responses = new Map();
  }

  async startServer() {
    console.log('🔧 Starting Schema Conflict Resolution...\n');
    
    this.server = spawn('node', [join(__dirname, 'simple-server.js')], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.server.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString().trim());
        this.handleResponse(response);
      } catch (error) {
        console.log('Raw output:', data.toString());
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async sendRequest(method, params = {}) {
    const id = this.requestId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    console.log(`📤 Sending: ${method}`);
    if (Object.keys(params).length > 0) {
      console.log(`   Params: ${JSON.stringify(params, null, 2)}`);
    }

    this.server.stdin.write(JSON.stringify(request) + '\n');

    return new Promise((resolve) => {
      this.responses.set(id, resolve);
    });
  }

  handleResponse(response) {
    const { id, result, error } = response;
    
    if (error) {
      console.log(`❌ Error: ${error.message}\n`);
    } else {
      console.log(`✅ Success:`);
      if (result && result.content && result.content[0] && result.content[0].text) {
        console.log(result.content[0].text);
      } else if (result) {
        console.log(JSON.stringify(result, null, 2));
      }
      console.log('');
    }

    if (this.responses.has(id)) {
      this.responses.get(id)(response);
      this.responses.delete(id);
    }
  }

  async fixSchema() {
    try {
      await this.startServer();

      console.log('🔍 Checking Current Database Schema');
      console.log('='.repeat(50));

      // Step 1: List current tables
      console.log('\n=== Step 1: List Current Tables ===');
      await this.sendRequest('tools/call', {
        name: 'list_tables',
        arguments: {}
      });

      // Step 2: Check contacts table structure
      console.log('\n=== Step 2: Query Contacts Table Structure ===');
      await this.sendRequest('tools/call', {
        name: 'query_table',
        arguments: {
          table: 'contacts',
          limit: 1
        }
      });

      // Step 3: Check mcp_test table
      console.log('\n=== Step 3: Query MCP Test Table ===');
      await this.sendRequest('tools/call', {
        name: 'query_table',
        arguments: {
          table: 'mcp_test',
          limit: 5
        }
      });

      console.log('\n' + '='.repeat(50));
      console.log('📋 Schema Analysis Complete!');
      console.log('\n🔧 Next Steps to Fix Conflicts:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Run: DROP TABLE IF EXISTS contacts CASCADE;');
      console.log('3. Run: DROP TABLE IF EXISTS mcp_test CASCADE;');
      console.log('4. Then run the complete supabase_crm_schema.sql');
      console.log('\n⚠️  Alternative: Add IF NOT EXISTS clauses to avoid conflicts');
      console.log('💡 The comprehensive schema will create proper CRM tables');

    } catch (error) {
      console.error('❌ Schema analysis failed:', error.message);
    } finally {
      if (this.server) {
        this.server.kill();
      }
    }
  }

  async stop() {
    if (this.server) {
      this.server.kill();
    }
  }
}

// Run schema analysis
const fixer = new SchemaFixer();
fixer.fixSchema().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping schema analysis...');
  fixer.stop();
  process.exit(0);
});