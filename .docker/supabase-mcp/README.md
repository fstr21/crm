# Supabase MCP Server

A comprehensive Model Context Protocol (MCP) server for Supabase integration with the CRM project.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Supabase project created at https://supabase.com/dashboard
- Service role key from Supabase project settings

### Setup Instructions

1. **Configure environment variables**:
   ```bash
   # Update .env file with your Supabase credentials
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_TOKEN=your-service-role-key
   ```

2. **Start the MCP server**:
   ```bash
   docker-compose up -d supabase-mcp
   ```

3. **Create database tables** (in Supabase Dashboard → SQL Editor):
   ```sql
   -- Create test table
   CREATE TABLE IF NOT EXISTS mcp_test (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create contacts table
   CREATE TABLE IF NOT EXISTS contacts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT UNIQUE NOT NULL,
     first_name TEXT NOT NULL,
     last_name TEXT,
     company TEXT,
     phone TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Insert sample data
   INSERT INTO mcp_test (name, email) VALUES 
   ('Test User 1', 'test1@example.com'),
   ('Test User 2', 'test2@example.com');
   ```

4. **Test the setup**:
   ```bash
   docker-compose exec supabase-mcp node test-with-tables.js
   ```

## 🔧 Available Tools

The MCP server provides these tools:

- **`test_connection`** - Test Supabase connection and show basic info
- **`query_table`** - Query any table in the database
- **`list_tables`** - List all tables in the public schema
- **`create_test_table`** - Create a test table to verify write access
- **`insert_test_data`** - Insert test data into a table

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│           CRM Application                   │
│                    │                        │
│                    ▼                        │
│         Supabase MCP Server                 │
│  ┌─────────────────────────────────────┐   │
│  │  JSON-RPC Protocol                  │   │
│  │  ├─ Connection Management           │   │
│  │  ├─ Database Operations             │   │
│  │  ├─ Error Handling                  │   │
│  │  └─ Logging                         │   │
│  └─────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│           Supabase Database                 │
│           (PostgreSQL)                      │
└─────────────────────────────────────────────┘
```

## 🧪 Testing

### Basic Protocol Test
```bash
docker-compose exec supabase-mcp node test-mcp.js
```

### Database Operations Test
```bash
docker-compose exec supabase-mcp node test-with-tables.js
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check SUPABASE_URL is correct
   - Verify service role key is valid
   - Ensure database exists

2. **Table Not Found**
   - Run the schema creation SQL in Supabase Dashboard
   - Check table names match exactly

3. **Permission Errors**
   - Ensure using service role key (not anon key)
   - Check RLS policies if enabled

### Debug Commands

```bash
# Check container logs
docker-compose logs supabase-mcp

# Check environment variables
docker-compose exec supabase-mcp env | grep SUPABASE
```

## 📋 Next Steps

1. **CRM Integration**: Connect this MCP server to your CRM application
2. **Schema Enhancement**: Add more CRM-specific tables (tasks, activities, etc.)
3. **Advanced Features**: Add real-time subscriptions, file uploads, auth
4. **Monitoring**: Set up health checks and logging
5. **Testing**: Add comprehensive test suite for all operations

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs)
- [CRM Project Repository](https://github.com/fstr21/crm)
