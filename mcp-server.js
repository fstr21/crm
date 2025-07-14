#!/usr/bin/env node

/**
 * MCP Server for CRM Application
 * Using @modelcontextprotocol/sdk version 0.4.0
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create server instance
const server = new Server(
  {
    name: "crm-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools = [
  {
    name: "get_customers",
    description: "Retrieve all customers from the CRM database",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of customers to return",
          default: 10,
        },
        offset: {
          type: "number", 
          description: "Number of customers to skip",
          default: 0,
        },
      },
    },
  },
  {
    name: "create_customer",
    description: "Create a new customer in the CRM",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Customer name",
        },
        email: {
          type: "string",
          description: "Customer email address",
        },
        company: {
          type: "string",
          description: "Customer company name",
        },
      },
      required: ["name", "email"],
    },
  },
  {
    name: "update_customer",
    description: "Update an existing customer",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Customer ID",
        },
        name: {
          type: "string", 
          description: "Customer name",
        },
        email: {
          type: "string",
          description: "Customer email address",
        },
        company: {
          type: "string",
          description: "Customer company name",
        },
      },
      required: ["id"],
    },
  },
];

// Register tools/list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Register tools/call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_customers":
        return await handleGetCustomers(args);
      
      case "create_customer":
        return await handleCreateCustomer(args);
      
      case "update_customer":
        return await handleUpdateCustomer(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Tool implementation functions
async function handleGetCustomers(args) {
  const { limit = 10, offset = 0 } = args;
  
  // Simulate database query
  const customers = [
    { id: "1", name: "John Doe", email: "john@example.com", company: "Acme Corp" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", company: "Tech Inc" },
  ];
  
  const results = customers.slice(offset, offset + limit);
  
  return {
    content: [
      {
        type: "text",
        text: `Retrieved ${results.length} customers:\n${JSON.stringify(results, null, 2)}`,
      },
    ],
  };
}

async function handleCreateCustomer(args) {
  const { name, email, company } = args;
  
  // Simulate customer creation
  const newCustomer = {
    id: Date.now().toString(),
    name,
    email,
    company: company || null,
    createdAt: new Date().toISOString(),
  };
  
  return {
    content: [
      {
        type: "text",
        text: `Created customer successfully:\n${JSON.stringify(newCustomer, null, 2)}`,
      },
    ],
  };
}

async function handleUpdateCustomer(args) {
  const { id, name, email, company } = args;
  
  // Simulate customer update
  const updatedCustomer = {
    id,
    name: name || "Existing Name",
    email: email || "existing@example.com", 
    company: company || "Existing Company",
    updatedAt: new Date().toISOString(),
  };
  
  return {
    content: [
      {
        type: "text",
        text: `Updated customer successfully:\n${JSON.stringify(updatedCustomer, null, 2)}`,
      },
    ],
  };
}

// Error handling
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.close();
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CRM MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});