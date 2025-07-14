#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CRMSchemaSetup {
  constructor() {
    this.requestId = 1;
    this.responses = new Map();
  }

  async startServer() {
    console.log('🚀 Starting CRM Schema Setup...\n');
    
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

    this.server.stdin.write(JSON.stringify(request) + '\n');

    return new Promise((resolve) => {
      this.responses.set(id, resolve);
    });
  }

  handleResponse(response) {
    const { id, result, error } = response;
    
    if (error) {
      console.log(`❌ Error: ${error.message}\n`);
    } else if (result && result.content && result.content[0] && result.content[0].text) {
      console.log(`✅ Success:`);
      console.log(result.content[0].text);
      console.log('');
    }

    if (this.responses.has(id)) {
      this.responses.get(id)(response);
      this.responses.delete(id);
    }
  }

  async setupSchema() {
    try {
      await this.startServer();

      console.log('🏗️  Setting up CRM Database Schema');
      console.log('='.repeat(50));

      // Test 1: Create basic tables first
      console.log('\n=== Step 1: Creating MCP Test Table ===');
      await this.sendRequest('tools/call', {
        name: 'create_test_table',
        arguments: {
          tableName: 'mcp_test'
        }
      });

      // Test 2: Create contacts table
      console.log('\n=== Step 2: Creating Contacts Table ===');
      await this.sendRequest('tools/call', {
        name: 'create_test_table',
        arguments: {
          tableName: 'contacts'
        }
      });

      // Test 3: Insert sample contact data
      console.log('\n=== Step 3: Inserting Sample Contact Data ===');
      await this.sendRequest('tools/call', {
        name: 'insert_test_data',
        arguments: {
          table: 'contacts',
          data: {
            email: 'john.doe@company.com',
            first_name: 'John',
            last_name: 'Doe',
            company: 'Test Company',
            phone: '555-0101'
          }
        }
      });

      await this.sendRequest('tools/call', {
        name: 'insert_test_data',
        arguments: {
          table: 'contacts',
          data: {
            email: 'jane.smith@startup.io',
            first_name: 'Jane',
            last_name: 'Smith',
            company: 'Startup Inc',
            phone: '555-0102'
          }
        }
      });

      // Test 4: Query contacts
      console.log('\n=== Step 4: Querying Contacts ===');
      await this.sendRequest('tools/call', {
        name: 'query_table',
        arguments: {
          table: 'contacts',
          limit: 10
        }
      });

      // Test 5: Insert MCP test data
      console.log('\n=== Step 5: Inserting MCP Test Data ===');
      await this.sendRequest('tools/call', {
        name: 'insert_test_data',
        arguments: {
          table: 'mcp_test',
          data: {
            name: 'CRM Schema Setup Test',
            email: 'test@crm-setup.com'
          }
        }
      });

      // Test 6: Query MCP test data
      console.log('\n=== Step 6: Querying MCP Test Data ===');
      await this.sendRequest('tools/call', {
        name: 'query_table',
        arguments: {
          table: 'mcp_test',
          limit: 10
        }
      });

      console.log('\n' + '='.repeat(50));
      console.log('🎉 CRM Schema Setup Complete!');
      console.log('\n📋 Next Steps:');
      console.log('1. Run the full SQL schema in Supabase Dashboard');
      console.log('2. Test the MCP server with real CRM data');
      console.log('3. Integrate with your CRM application');
      console.log('4. Set up proper authentication and permissions');
      console.log('\n🔗 Schema file: supabase_crm_schema.sql');
      console.log('📖 Documentation: .docker/supabase-mcp/README.md');

    } catch (error) {
      console.error('❌ Schema setup failed:', error.message);
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

// Run schema setup
const setup = new CRMSchemaSetup();
setup.setupSchema().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping schema setup...');
  setup.stop();
  process.exit(0);
});