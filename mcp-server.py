#!/usr/bin/env python3
"""
MCP Server for CRM Application
Using mcp package version 0.4.0
"""

import asyncio
import json
import sys
from typing import Any, Dict, List

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    CallToolRequest,
    CallToolResult,
    ListToolsRequest,
    ListToolsResult,
)

# Create server instance
server = Server("crm-mcp-server")

# Define available tools
TOOLS = [
    Tool(
        name="get_customers",
        description="Retrieve all customers from the CRM database",
        inputSchema={
            "type": "object",
            "properties": {
                "limit": {
                    "type": "number",
                    "description": "Maximum number of customers to return",
                    "default": 10,
                },
                "offset": {
                    "type": "number",
                    "description": "Number of customers to skip", 
                    "default": 0,
                },
            },
        },
    ),
    Tool(
        name="create_customer",
        description="Create a new customer in the CRM",
        inputSchema={
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Customer name",
                },
                "email": {
                    "type": "string",
                    "description": "Customer email address",
                },
                "company": {
                    "type": "string",
                    "description": "Customer company name",
                },
            },
            "required": ["name", "email"],
        },
    ),
    Tool(
        name="update_customer",
        description="Update an existing customer",
        inputSchema={
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "description": "Customer ID",
                },
                "name": {
                    "type": "string",
                    "description": "Customer name",
                },
                "email": {
                    "type": "string", 
                    "description": "Customer email address",
                },
                "company": {
                    "type": "string",
                    "description": "Customer company name",
                },
            },
            "required": ["id"],
        },
    ),
]

@server.list_tools()
async def list_tools() -> ListToolsResult:
    """List available tools."""
    return ListToolsResult(tools=TOOLS)

@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
    """Handle tool calls."""
    
    try:
        if name == "get_customers":
            return await handle_get_customers(arguments)
        elif name == "create_customer":
            return await handle_create_customer(arguments)
        elif name == "update_customer":
            return await handle_update_customer(arguments)
        else:
            raise ValueError(f"Unknown tool: {name}")
    except Exception as error:
        return CallToolResult(
            content=[
                TextContent(
                    type="text",
                    text=f"Error executing {name}: {str(error)}",
                )
            ],
            isError=True,
        )

async def handle_get_customers(args: Dict[str, Any]) -> CallToolResult:
    """Handle get_customers tool call."""
    limit = args.get("limit", 10)
    offset = args.get("offset", 0)
    
    # Simulate database query
    customers = [
        {"id": "1", "name": "John Doe", "email": "john@example.com", "company": "Acme Corp"},
        {"id": "2", "name": "Jane Smith", "email": "jane@example.com", "company": "Tech Inc"},
    ]
    
    results = customers[offset:offset + limit]
    
    return CallToolResult(
        content=[
            TextContent(
                type="text",
                text=f"Retrieved {len(results)} customers:\n{json.dumps(results, indent=2)}",
            )
        ]
    )

async def handle_create_customer(args: Dict[str, Any]) -> CallToolResult:
    """Handle create_customer tool call."""
    name = args.get("name")
    email = args.get("email")
    company = args.get("company")
    
    if not name or not email:
        raise ValueError("Name and email are required")
    
    # Simulate customer creation
    import time
    new_customer = {
        "id": str(int(time.time())),
        "name": name,
        "email": email,
        "company": company,
        "createdAt": "2024-01-01T00:00:00Z",
    }
    
    return CallToolResult(
        content=[
            TextContent(
                type="text", 
                text=f"Created customer successfully:\n{json.dumps(new_customer, indent=2)}",
            )
        ]
    )

async def handle_update_customer(args: Dict[str, Any]) -> CallToolResult:
    """Handle update_customer tool call."""
    customer_id = args.get("id")
    name = args.get("name")
    email = args.get("email")
    company = args.get("company")
    
    if not customer_id:
        raise ValueError("Customer ID is required")
    
    # Simulate customer update
    updated_customer = {
        "id": customer_id,
        "name": name or "Existing Name",
        "email": email or "existing@example.com",
        "company": company or "Existing Company", 
        "updatedAt": "2024-01-01T00:00:00Z",
    }
    
    return CallToolResult(
        content=[
            TextContent(
                type="text",
                text=f"Updated customer successfully:\n{json.dumps(updated_customer, indent=2)}",
            )
        ]
    )

async def main():
    """Run the MCP server."""
    # Run the server using stdio transport
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream, 
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())