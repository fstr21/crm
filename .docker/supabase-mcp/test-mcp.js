#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test the MCP server by sending JSON-RPC requests via stdin/stdout
class MCPTester {
  constructor() {
    this.requestId = 1;
    this.responses = new Map();
  }

  async startServer() {
    console.log('🧪 Starting MCP Server Test...\n');
    
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

    this.server.on('error', (error) => {
      console.error('❌ Server error:', error.message);
    });

    // Wait a moment for server to start
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

    // Wait for response
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

  async runTests() {
    try {
      await this.startServer();

      // Test 1: Initialize
      console.log('=== Test 1: Initialize ===');
      await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      });

      // Test 2: List tools
      console.log('=== Test 2: List Tools ===');
      await this.sendRequest('tools/list');

      // Test 3: Test connection
      console.log('=== Test 3: Test Connection ===');
      await this.sendRequest('tools/call', {
        name: 'test_connection',
        arguments: {}
      });

      // Test 4: List tables (will likely fail without real URL)
      console.log('=== Test 4: List Tables ===');
      await this.sendRequest('tools/call', {
        name: 'list_tables',
        arguments: {}
      });

      // Test 5: Query table (will likely fail without real URL)
      console.log('=== Test 5: Query Information Schema ===');
      await this.sendRequest('tools/call', {
        name: 'query_table',
        arguments: {
          table: 'information_schema.tables',
          limit: 5
        }
      });

      console.log('🎉 All tests completed!');
      console.log('\n📝 Note: Some tests may fail without a real Supabase URL configured.');
      console.log('   To set up a real Supabase project:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Create a new project');
      console.log('   3. Get the Project URL from Settings → API');
      console.log('   4. Update SUPABASE_URL in .env file');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
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

// Run tests
const tester = new MCPTester();
tester.runTests().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping tests...');
  tester.stop();
  process.exit(0);
});