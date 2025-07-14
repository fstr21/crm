#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3030;

// Middleware
app.use(cors());
app.use(express.json());

// MCP Server Manager
class MCPServerManager {
  constructor() {
    this.server = null;
    this.requestId = 1;
    this.pendingRequests = new Map();
    this.startMCPServer();
  }

  startMCPServer() {
    console.log('🚀 Starting MCP Server...');
    
    this.server = spawn('node', [join(__dirname, 'simple-server.js')], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.server.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString().trim());
        this.handleMCPResponse(response);
      } catch (error) {
        console.log('Raw MCP output:', data.toString());
      }
    });

    this.server.on('error', (error) => {
      console.error('❌ MCP Server error:', error.message);
    });

    this.server.on('exit', (code) => {
      console.log(`MCP Server exited with code ${code}`);
      // Restart after 2 seconds
      setTimeout(() => this.startMCPServer(), 2000);
    });
  }

  handleMCPResponse(response) {
    const { id, result, error } = response;
    
    if (this.pendingRequests.has(id)) {
      const { resolve, reject } = this.pendingRequests.get(id);
      this.pendingRequests.delete(id);
      
      if (error) {
        reject(new Error(error.message));
      } else {
        resolve(result);
      }
    }
  }

  async sendMCPRequest(method, params = {}) {
    const id = this.requestId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      // Set timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 5000);

      this.server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async queryTable(table, limit = 10) {
    const result = await this.sendMCPRequest('tools/call', {
      name: 'query_table',
      arguments: { table, limit }
    });
    
    if (result.content && result.content[0] && result.content[0].text) {
      const text = result.content[0].text;
      // Extract JSON from the response text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    return [];
  }

  async insertData(table, data) {
    const result = await this.sendMCPRequest('tools/call', {
      name: 'insert_test_data',
      arguments: { table, data }
    });
    
    if (result.content && result.content[0] && result.content[0].text) {
      const text = result.content[0].text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])[0];
      }
    }
    return data;
  }
}

const mcpManager = new MCPServerManager();

// Helper function to transform contact data
function transformContact(contact) {
  return {
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
    email: contact.email,
    phone: contact.phone,
    company: contact.company_name || contact.company,
    status: contact.contact_status === 'active' ? 'warm' : 
           contact.contact_status === 'prospect' ? 'hot' : 'cold',
    value: contact.annual_revenue || Math.floor(Math.random() * 50000) + 10000,
    created_at: contact.created_at,
    updated_at: contact.updated_at || contact.created_at
  };
}

function transformTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status === 'pending' ? 'pending' :
           task.status === 'in_progress' ? 'in_progress' : 'completed',
    priority: task.priority || 'medium',
    due_date: task.due_date,
    contact_id: task.contact_id,
    assigned_to: task.assigned_to,
    created_at: task.created_at,
    updated_at: task.updated_at
  };
}

function transformActivity(activity) {
  return {
    id: activity.id,
    type: activity.activity_type,
    title: activity.subject,
    description: activity.description,
    contact_id: activity.contact_id,
    task_id: activity.task_id,
    user_id: activity.created_by || 'system',
    created_at: activity.created_at || activity.activity_date
  };
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await mcpManager.sendMCPRequest('tools/list');
    res.json({ 
      status: 'connected', 
      timestamp: new Date().toISOString(),
      server: 'Supabase MCP Server'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'disconnected', 
      timestamp: new Date().toISOString(),
      error: error.message 
    });
  }
});

// Contacts endpoints
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await mcpManager.queryTable('contacts', 20);
    const transformedContacts = contacts.map(transformContact);
    res.json(transformedContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contacts = await mcpManager.queryTable('contacts', 100);
    const contact = contacts.find(c => c.id === req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(transformContact(contact));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, company, status, value } = req.body;
    const [firstName, ...lastNameParts] = name.split(' ');
    
    const contactData = {
      first_name: firstName,
      last_name: lastNameParts.join(' ') || '',
      email,
      phone,
      company_name: company,
      contact_status: status === 'hot' ? 'prospect' : 
                    status === 'warm' ? 'active' : 'inactive',
      annual_revenue: value
    };
    
    const newContact = await mcpManager.insertData('contacts', contactData);
    res.json(transformContact(newContact));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await mcpManager.queryTable('tasks', 20);
    const transformedTasks = tasks.map(transformTask);
    res.json(transformedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const taskData = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'pending',
      priority: req.body.priority || 'medium',
      due_date: req.body.due_date,
      contact_id: req.body.contact_id
    };
    
    const newTask = await mcpManager.insertData('tasks', taskData);
    res.json(transformTask(newTask));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activities endpoints
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await mcpManager.queryTable('activities', 20);
    const transformedActivities = activities.map(transformActivity);
    res.json(transformedActivities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const activityData = {
      activity_type: req.body.type,
      subject: req.body.title,
      description: req.body.description,
      contact_id: req.body.contact_id,
      task_id: req.body.task_id,
      created_by: req.body.user_id || 'system'
    };
    
    const newActivity = await mcpManager.insertData('activities', activityData);
    res.json(transformActivity(newActivity));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 HTTP API Server running on http://localhost:${PORT}`);
  console.log(`🔗 Ready to proxy requests to MCP Server`);
  console.log(`🎯 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HTTP API Server...');
  if (mcpManager.server) {
    mcpManager.server.kill();
  }
  process.exit(0);
});