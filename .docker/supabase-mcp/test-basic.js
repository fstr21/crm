#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Basic test without information_schema queries
class BasicMCPTester {
  constructor() {
    this.requestId = 1;
    this.responses = new Map();
  }

  async startServer() {
    console.log('🧪 Starting Basic MCP Test...\n');
    
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

  async runTests() {
    try {
      await this.startServer();

      // Test 1: List tools
      console.log('=== Test 1: List Tools ===');
      await this.sendRequest('tools/list');

      // Test 2: Create test table
      console.log('=== Test 2: Create Test Table ===');
      await this.sendRequest('tools/call', {
        name: 'create_test_table',
        arguments: {
          tableName: 'mcp_test'
        }
      });

      // Test 3: Insert test data
      console.log('=== Test 3: Insert Test Data ===');
      await this.sendRequest('tools/call', {
        name: 'insert_test_data',
        arguments: {
          table: 'mcp_test',
          data: {
            name: 'Test Contact',
            email: 'test@example.com'
          }
        }
      });

      // Test 4: Query test table
      console.log('=== Test 4: Query Test Table ===');
      await this.sendRequest('tools/call', {
        name: 'query_table',
        arguments: {
          table: 'mcp_test',
          limit: 5
        }
      });

      console.log('🎉 Basic tests completed!');

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
const tester = new BasicMCPTester();
tester.runTests().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping tests...');
  tester.stop();
  process.exit(0);
});