#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/supabase-mcp.log' })
  ]
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseToken = process.env.SUPABASE_TOKEN;

if (!supabaseUrl || !supabaseToken) {
  logger.error('Missing required environment variables: SUPABASE_URL or SUPABASE_TOKEN');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseToken);

// Create MCP server
const server = new Server(
  {
    name: 'supabase-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  // Database Tools
  {
    name: 'supabase_query',
    description: 'Execute a SELECT query on Supabase database',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name to query' },
        select: { type: 'string', description: 'Columns to select (default: *)' },
        filter: { type: 'object', description: 'Filter conditions' },
        limit: { type: 'number', description: 'Limit number of results' },
        orderBy: { type: 'object', description: 'Order by configuration' }
      },
      required: ['table']
    }
  },
  {
    name: 'supabase_insert',
    description: 'Insert new records into Supabase database',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        data: { type: 'object', description: 'Data to insert' },
        returning: { type: 'string', description: 'Columns to return' }
      },
      required: ['table', 'data']
    }
  },
  {
    name: 'supabase_update',
    description: 'Update records in Supabase database',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        data: { type: 'object', description: 'Data to update' },
        filter: { type: 'object', description: 'Filter conditions' },
        returning: { type: 'string', description: 'Columns to return' }
      },
      required: ['table', 'data', 'filter']
    }
  },
  {
    name: 'supabase_delete',
    description: 'Delete records from Supabase database',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filter: { type: 'object', description: 'Filter conditions' },
        returning: { type: 'string', description: 'Columns to return' }
      },
      required: ['table', 'filter']
    }
  },

  // CRM-Specific Tools
  {
    name: 'crm_create_contact',
    description: 'Create a new contact in the CRM',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Contact email' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        company: { type: 'string', description: 'Company name' },
        phone: { type: 'string', description: 'Phone number' },
        userId: { type: 'string', description: 'User ID who owns this contact' }
      },
      required: ['email', 'firstName', 'userId']
    }
  },
  {
    name: 'crm_create_task',
    description: 'Create a new task in the CRM',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        status: { type: 'string', description: 'Task status (TODO, IN_PROGRESS, COMPLETED)' },
        priority: { type: 'string', description: 'Priority (LOW, MEDIUM, HIGH, URGENT)' },
        userId: { type: 'string', description: 'User ID who owns this task' },
        contactId: { type: 'string', description: 'Associated contact ID' },
        dueDate: { type: 'string', description: 'Due date (ISO string)' }
      },
      required: ['title', 'userId']
    }
  },
  {
    name: 'crm_get_dashboard_data',
    description: 'Get dashboard data for CRM analytics',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        timeframe: { type: 'string', description: 'Timeframe (week, month, year)' }
      },
      required: ['userId']
    }
  },

  // Authentication Tools
  {
    name: 'supabase_auth_status',
    description: 'Check current authentication status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'supabase_auth_signup',
    description: 'Sign up a new user (for testing)',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'User email' },
        password: { type: 'string', description: 'User password' },
        metadata: { type: 'object', description: 'Additional user metadata' }
      },
      required: ['email', 'password']
    }
  },

  // Storage Tools
  {
    name: 'supabase_storage_upload',
    description: 'Upload a file to Supabase storage',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Storage bucket name' },
        path: { type: 'string', description: 'File path in bucket' },
        file: { type: 'string', description: 'File content (base64 or text)' },
        contentType: { type: 'string', description: 'MIME type of the file' }
      },
      required: ['bucket', 'path', 'file']
    }
  },
  {
    name: 'supabase_storage_list',
    description: 'List files in a storage bucket',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Storage bucket name' },
        prefix: { type: 'string', description: 'Path prefix to filter files' }
      },
      required: ['bucket']
    }
  },

  // Real-time Tools
  {
    name: 'supabase_realtime_subscribe',
    description: 'Subscribe to real-time changes on a table',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name to subscribe to' },
        event: { type: 'string', description: 'Event type (INSERT, UPDATE, DELETE, *)' },
        filter: { type: 'string', description: 'Filter expression' }
      },
      required: ['table']
    }
  },

  // Schema Management Tools
  {
    name: 'supabase_create_crm_schema',
    description: 'Create the CRM database schema in Supabase',
    inputSchema: {
      type: 'object',
      properties: {
        dropExisting: { type: 'boolean', description: 'Drop existing tables first' }
      },
      required: []
    }
  },
  {
    name: 'supabase_get_schema_info',
    description: 'Get information about database schema',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Specific table name (optional)' }
      },
      required: []
    }
  }
];

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    logger.info(`Executing tool: ${name}`, { args });
    
    switch (name) {
      case 'supabase_query':
        return await executeQuery(args);
      case 'supabase_insert':
        return await executeInsert(args);
      case 'supabase_update':
        return await executeUpdate(args);
      case 'supabase_delete':
        return await executeDelete(args);
      case 'crm_create_contact':
        return await createContact(args);
      case 'crm_create_task':
        return await createTask(args);
      case 'crm_get_dashboard_data':
        return await getDashboardData(args);
      case 'supabase_auth_status':
        return await getAuthStatus();
      case 'supabase_auth_signup':
        return await authSignup(args);
      case 'supabase_storage_upload':
        return await uploadFile(args);
      case 'supabase_storage_list':
        return await listFiles(args);
      case 'supabase_realtime_subscribe':
        return await subscribeRealtime(args);
      case 'supabase_create_crm_schema':
        return await createCrmSchema(args);
      case 'supabase_get_schema_info':
        return await getSchemaInfo(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`Tool execution failed: ${name}`, { error: error.message, args });
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`
        }
      ]
    };
  }
});

// Tool implementation functions
async function executeQuery(args) {
  const { table, select = '*', filter = {}, limit, orderBy } = args;
  
  let query = supabase.from(table).select(select);
  
  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  // Apply ordering
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
  }
  
  // Apply limit
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return {
    content: [
      {
        type: 'text',
        text: `Query successful. Found ${data.length} records.\n\n${JSON.stringify(data, null, 2)}`
      }
    ]
  };
}

async function executeInsert(args) {
  const { table, data, returning = '*' } = args;
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select(returning);
  
  if (error) throw error;
  
  return {
    content: [
      {
        type: 'text',
        text: `Insert successful.\n\n${JSON.stringify(result, null, 2)}`
      }
    ]
  };
}

async function executeUpdate(args) {
  const { table, data, filter, returning = '*' } = args;
  
  let query = supabase.from(table).update(data);
  
  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  const { data: result, error } = await query.select(returning);
  
  if (error) throw error;
  
  return {
    content: [
      {
        type: 'text',
        text: `Update successful. Updated ${result.length} records.\n\n${JSON.stringify(result, null, 2)}`
      }
    ]
  };
}

async function executeDelete(args) {
  const { table, filter, returning } = args;
  
  let query = supabase.from(table).delete();
  
  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  if (returning) {
    query = query.select(returning);
  }
  
  const { data: result, error } = await query;
  
  if (error) throw error;
  
  return {
    content: [
      {
        type: 'text',
        text: `Delete successful. ${returning ? `Deleted records:\n${JSON.stringify(result, null, 2)}` : 'Records deleted successfully.'}`
      }
    ]
  };
}

async function createContact(args) {
  const contactData = {
    ...args,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('contacts')
    .insert(contactData)
    .select();
  
  if (error) throw error;
  
  // Create activity log
  if (data && data[0]) {
    await supabase.from('activities').insert({
      type: 'CONTACT_CREATED',
      title: 'Contact created',
      content: `${args.firstName} ${args.lastName || ''} was added to contacts`,
      userId: args.userId,
      contactId: data[0].id,
      createdAt: new Date().toISOString()
    });
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `Contact created successfully!\n\n${JSON.stringify(data[0], null, 2)}`
      }
    ]
  };
}

async function createTask(args) {
  const taskData = {
    ...args,
    status: args.status || 'TODO',
    priority: args.priority || 'MEDIUM',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (args.dueDate) {
    taskData.dueDate = new Date(args.dueDate).toISOString();
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select();
  
  if (error) throw error;
  
  // Create activity log
  if (data && data[0]) {
    await supabase.from('activities').insert({
      type: 'TASK_CREATED',
      title: 'Task created',
      content: `Task "${args.title}" was created`,
      userId: args.userId,
      taskId: data[0].id,
      contactId: args.contactId || null,
      createdAt: new Date().toISOString()
    });
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `Task created successfully!\n\n${JSON.stringify(data[0], null, 2)}`
      }
    ]
  };
}

async function getDashboardData(args) {
  const { userId, timeframe = 'month' } = args;
  
  // Get date range based on timeframe
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  // Get dashboard metrics
  const [contactsResult, tasksResult, activitiesResult] = await Promise.all([
    supabase.from('contacts').select('id, status, createdAt').eq('userId', userId),
    supabase.from('tasks').select('id, status, priority, dueDate, createdAt').eq('userId', userId),
    supabase.from('activities').select('id, type, createdAt').eq('userId', userId).gte('createdAt', startDate.toISOString())
  ]);
  
  if (contactsResult.error) throw contactsResult.error;
  if (tasksResult.error) throw tasksResult.error;
  if (activitiesResult.error) throw activitiesResult.error;
  
  const dashboard = {
    contacts: {
      total: contactsResult.data.length,
      active: contactsResult.data.filter(c => c.status === 'ACTIVE').length,
      prospects: contactsResult.data.filter(c => c.status === 'PROSPECT').length,
      customers: contactsResult.data.filter(c => c.status === 'CUSTOMER').length
    },
    tasks: {
      total: tasksResult.data.length,
      todo: tasksResult.data.filter(t => t.status === 'TODO').length,
      inProgress: tasksResult.data.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasksResult.data.filter(t => t.status === 'COMPLETED').length,
      overdue: tasksResult.data.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED').length
    },
    activities: {
      total: activitiesResult.data.length,
      byType: activitiesResult.data.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {})
    },
    timeframe
  };
  
  return {
    content: [
      {
        type: 'text',
        text: `Dashboard data for ${timeframe}:\n\n${JSON.stringify(dashboard, null, 2)}`
      }
    ]
  };
}

async function getAuthStatus() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  return {
    content: [
      {
        type: 'text',
        text: `Auth status: ${user ? 'Authenticated' : 'Not authenticated'}\n\nUser: ${JSON.stringify(user, null, 2)}`
      }
    ]
  };
}

async function authSignup(args) {
  const { email, password, metadata = {} } = args;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  if (error) throw error;
  
  return {
    content: [
      {
        type: 'text',
        text: `Signup ${data.user ? 'successful' : 'initiated'}!\n\n${JSON.stringify(data, null, 2)}`
      }
    ]
  };
}

async function uploadFile(args) {
  const { bucket, path, file, contentType } = args;
  
  // Convert file content to appropriate format
  let fileData;
  if (contentType && contentType.startsWith('text/')) {
    fileData = file;
  } else {
    // Assume base64 for binary files
    fileData = Buffer.from(file, 'base64');
  }
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileData, {
      contentType,
      upsert: true
    });
  
  if (error) throw error;
  
  return {
    content: [
      {
        type: 'text',
        text: `File uploaded successfully!\n\n${JSON.stringify(data, null, 2)}`
      }
    ]
  };
}

async function listFiles(args) {
  const { bucket, prefix } = args;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix || '');
  
  if (error) throw error;
  
  return {
    content: [
      {
        type: 'text',
        text: `Files in bucket '${bucket}'${prefix ? ` with prefix '${prefix}'` : ''}:\n\n${JSON.stringify(data, null, 2)}`
      }
    ]
  };
}

async function subscribeRealtime(args) {
  const { table, event = '*', filter } = args;
  
  // Note: In a real implementation, this would set up a subscription
  // For demonstration, we'll just return subscription info
  const subscriptionConfig = {
    table,
    event,
    filter,
    status: 'simulated_subscription'
  };
  
  return {
    content: [
      {
        type: 'text',
        text: `Real-time subscription configured (simulation):\n\n${JSON.stringify(subscriptionConfig, null, 2)}\n\nNote: Actual real-time subscriptions require WebSocket connection.`
      }
    ]
  };
}

async function createCrmSchema(args) {
  const { dropExisting = false } = args;
  
  const sqlCommands = [];
  
  if (dropExisting) {
    sqlCommands.push(
      'DROP TABLE IF EXISTS activities CASCADE;',
      'DROP TABLE IF EXISTS tasks CASCADE;',
      'DROP TABLE IF EXISTS contacts CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP TYPE IF EXISTS user_role CASCADE;',
      'DROP TYPE IF EXISTS contact_status CASCADE;',
      'DROP TYPE IF EXISTS task_status CASCADE;',
      'DROP TYPE IF EXISTS priority CASCADE;',
      'DROP TYPE IF EXISTS activity_type CASCADE;'
    );
  }
  
  // Create enums
  sqlCommands.push(
    `CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');`,
    `CREATE TYPE contact_status AS ENUM ('ACTIVE', 'INACTIVE', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER');`,
    `CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');`,
    `CREATE TYPE priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');`,
    `CREATE TYPE activity_type AS ENUM ('CONTACT_CREATED', 'CONTACT_UPDATED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED', 'EMAIL_SENT', 'CALL_MADE', 'MEETING_SCHEDULED', 'NOTE_ADDED');`
  );
  
  // Create tables
  sqlCommands.push(
    `CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar TEXT,
      role user_role DEFAULT 'USER',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT,
      company TEXT,
      phone TEXT,
      website TEXT,
      status contact_status DEFAULT 'ACTIVE',
      source TEXT,
      tags TEXT[],
      notes TEXT,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      status task_status DEFAULT 'TODO',
      priority priority DEFAULT 'MEDIUM',
      due_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type activity_type NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      metadata JSONB,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
      task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  );
  
  // Create indexes
  sqlCommands.push(
    'CREATE INDEX idx_contacts_user_id ON contacts(user_id);',
    'CREATE INDEX idx_contacts_email ON contacts(email);',
    'CREATE INDEX idx_tasks_user_id ON tasks(user_id);',
    'CREATE INDEX idx_tasks_status ON tasks(status);',
    'CREATE INDEX idx_tasks_due_date ON tasks(due_date);',
    'CREATE INDEX idx_activities_user_id ON activities(user_id);',
    'CREATE INDEX idx_activities_type ON activities(type);',
    'CREATE INDEX idx_activities_created_at ON activities(created_at);'
  );
  
  // Execute all commands
  const results = [];
  for (const sql of sqlCommands) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        // If rpc doesn't exist, try direct SQL execution
        const { error: directError } = await supabase.from('').select(sql);
        if (directError) {
          results.push(`❌ ${sql}: ${error.message || directError.message}`);
        } else {
          results.push(`✅ ${sql}: Success`);
        }
      } else {
        results.push(`✅ ${sql}: Success`);
      }
    } catch (err) {
      results.push(`❌ ${sql}: ${err.message}`);
    }
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `CRM Schema Creation Results:\n\n${results.join('\n')}\n\nNote: Some commands may require database admin privileges. Use Supabase Dashboard SQL Editor for full schema creation.`
      }
    ]
  };
}

async function getSchemaInfo(args) {
  const { table } = args;
  
  try {
    // Get table information from information_schema
    let query = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `;
    
    if (table) {
      query += ` AND table_name = '${table}'`;
    }
    
    query += ' ORDER BY table_name, ordinal_position;';
    
    // Note: This would require a custom RPC function in real implementation
    return {
      content: [
        {
          type: 'text',
          text: `Schema information request for ${table || 'all tables'}.\n\nNote: Direct schema queries require custom RPC functions or Supabase Dashboard access.\n\nQuery to run in SQL Editor:\n${query}`
        }
      ]
    };
  } catch (error) {
    throw error;
  }
}

// Start the server
async function main() {
  logger.info('Starting Supabase MCP Server...');
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is okay
      throw error;
    }
    logger.info('Supabase connection successful');
  } catch (error) {
    logger.error('Supabase connection failed:', error.message);
    process.exit(1);
  }
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('Supabase MCP Server running on stdio');
}

main().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});