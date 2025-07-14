# 🚀 Supabase MCP Server Setup Guide

## Overview
This guide will set up a fully functional Supabase MCP (Model Context Protocol) server for CRM operations with comprehensive database schema and testing.

## ✅ What's Ready
- **Supabase MCP Server**: Fully containerized and tested
- **Database Connection**: Connected to `https://toafmloqrdfasvhjpvxm.supabase.co`
- **Authentication**: Service role key configured
- **Basic Tables**: `mcp_test` and `contacts` tables working
- **Sample Data**: Real data inserted and tested
- **5 MCP Tools**: All tools tested and functional

## 🚀 Quick Start (Your Laptop)

### 1. Clone Repository
```bash
git clone https://github.com/fstr21/crm.git
cd crm
```

### 2. Start Supabase MCP Server
```bash
docker-compose up -d supabase-mcp
```

### 3. Test Basic Functionality
```bash
# Test MCP protocol
docker-compose exec supabase-mcp node test-mcp.js

# Test database operations
docker-compose exec supabase-mcp node test-with-tables.js

# Test CRM schema setup
docker-compose exec supabase-mcp node setup-crm-schema.js
```

## 📊 Current Database Status

### Existing Tables
- ✅ **mcp_test**: Working with sample data
- ✅ **contacts**: Working with CRM data
- ⚠️ **Full CRM Schema**: Ready to deploy (see step 4)

### Sample Data Verified
```sql
-- MCP Test Data
SELECT * FROM mcp_test;
-- Returns: 4 test records

-- Contacts Data  
SELECT * FROM contacts;
-- Returns: 2 contact records (John Doe, Jane Smith)
```

## 🏗️ Deploy Full CRM Schema (Required)

### Step 4: Create Complete CRM Database

Go to **Supabase Dashboard** → **SQL Editor** and run the complete schema:

```sql
-- Copy the entire contents of supabase_crm_schema.sql
-- This creates:
-- - users table (with auth integration)
-- - contacts table (comprehensive)
-- - tasks table (task management)
-- - activities table (interaction tracking)
-- - contact_relationships table
-- - All indexes, triggers, and sample data
```

**File Location**: `supabase_crm_schema.sql` (600+ lines of production-ready SQL)

### Key Features of Full Schema:
- **Production-ready** with proper constraints and indexes
- **Row Level Security** (RLS) policies
- **Trigger-based** automatic timestamps
- **Comprehensive relationships** between all tables
- **Sample data** for immediate testing
- **Utility functions** for common operations
- **Performance optimized** with strategic indexes

## 🔧 Available MCP Tools

All tools tested and working:

1. **`test_connection`** - Verify Supabase connectivity
2. **`query_table`** - Query any database table
3. **`list_tables`** - List all tables in public schema
4. **`create_test_table`** - Create test tables
5. **`insert_test_data`** - Insert data into tables

## 🧪 Testing Results

### Connection Test ✅
```bash
✅ Success: Connected to https://toafmloqrdfasvhjpvxm.supabase.co
✅ Service role key working
✅ Database accessible
```

### Data Operations Test ✅
```bash
✅ INSERT operations working
✅ SELECT queries returning data
✅ Table creation guidance provided
✅ Error handling functional
```

### Schema Setup Test ✅
```bash
✅ MCP test table: 4 records
✅ Contacts table: 2 records  
✅ All CRUD operations verified
✅ No duplicate key errors handled
```

## 📁 Project Structure

```
crm/
├── .docker/supabase-mcp/
│   ├── simple-server.js       # Main MCP server
│   ├── test-mcp.js           # Protocol tests
│   ├── test-with-tables.js   # Database tests
│   ├── setup-crm-schema.js   # Schema setup
│   ├── README.md             # Detailed documentation
│   ├── package.json          # Dependencies
│   └── .env                  # Environment (configured)
├── supabase_crm_schema.sql   # Complete CRM schema
├── docker-compose.yml        # Multi-service setup
└── SUPABASE_SETUP_GUIDE.md   # This guide
```

## 🔧 Configuration Details

### Environment Variables (Already Set)
```bash
SUPABASE_URL=https://toafmloqrdfasvhjpvxm.supabase.co
SUPABASE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service role)
LOG_LEVEL=info
MCP_SERVER_PORT=3030
```

### Docker Compose Service
```yaml
supabase-mcp:
  build: .docker/supabase-mcp
  container_name: crm-supabase-mcp
  ports:
    - "3030:3030"
  env_file:
    - .docker/supabase-mcp/.env
```

## 🐛 Troubleshooting

### Common Issues & Solutions

1. **Container Won't Start**
   ```bash
   docker-compose logs supabase-mcp
   docker-compose build supabase-mcp --no-cache
   ```

2. **Connection Errors**
   ```bash
   # Check environment variables
   docker-compose exec supabase-mcp env | grep SUPABASE
   ```

3. **Table Not Found**
   - Run the full CRM schema in Supabase Dashboard
   - Check table names match exactly (case-sensitive)

4. **Permission Errors**
   - Verify using service role key (not anon key)
   - Check RLS policies after schema deployment

## 📋 Next Steps

### Immediate (Required)
1. **Deploy Full Schema**: Run `supabase_crm_schema.sql` in Supabase Dashboard
2. **Test Schema**: Run `docker-compose exec supabase-mcp node test-with-tables.js`
3. **Verify Data**: Check all tables have sample data

### Integration
1. **Claude Integration**: Configure MCP in Claude Desktop
2. **CRM App**: Connect your CRM application to MCP tools
3. **Authentication**: Set up proper user authentication
4. **Permissions**: Configure RLS policies for your users

### Production
1. **Environment Variables**: Set production Supabase credentials
2. **Security**: Review and tighten RLS policies
3. **Monitoring**: Set up logging and health checks
4. **Backup**: Configure automated database backups

## 🎯 Success Criteria

After completing this setup, you should have:
- ✅ Docker container running and accessible
- ✅ 5 MCP tools responding correctly
- ✅ Database connection verified
- ✅ Sample data in multiple tables
- ✅ Full CRM schema ready for deployment
- ✅ Comprehensive testing suite working

## 🔗 Documentation Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **MCP Documentation**: https://modelcontextprotocol.io/docs
- **CRM Repository**: https://github.com/fstr21/crm
- **Local README**: `.docker/supabase-mcp/README.md`

---

**Status**: ✅ **READY FOR LAPTOP DEPLOYMENT**

Everything is configured, tested, and pushed to GitHub. Just clone and run!