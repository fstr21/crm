# Supabase MCP Server

A comprehensive Model Context Protocol (MCP) server for Supabase integration with your CRM project.

## 🚀 Quick Start

### 1. Configure Environment Variables

Update `.env` with your Supabase project details:

```bash
SUPABASE_TOKEN=sbp_4c23fccbb9419a00fb4886e6b535f6829f31c904  # ✅ Already configured
SUPABASE_URL=https://your-project-id.supabase.co                # ⚠️ NEEDS UPDATE
LOG_LEVEL=info
MCP_SERVER_PORT=3030
NODE_ENV=development
```

**To get your Supabase URL:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the "Project URL" 

### 2. Build and Run

```bash
# Build the container
docker-compose build supabase-mcp

# Run the container
docker-compose up -d supabase-mcp

# Check status
docker-compose ps supabase-mcp
```

### 3. Run Tests

```bash
# Run comprehensive test suite
docker-compose exec supabase-mcp npm test

# Check health
docker-compose exec supabase-mcp npm run health

# View logs
docker-compose logs supabase-mcp
```

## 🛠️ Available Tools

### Database Operations
- `supabase_query` - Execute SELECT queries
- `supabase_insert` - Insert new records
- `supabase_update` - Update existing records  
- `supabase_delete` - Delete records

### CRM-Specific Operations
- `crm_create_contact` - Create new contacts
- `crm_create_task` - Create new tasks
- `crm_get_dashboard_data` - Get analytics data

### Authentication & User Management
- `supabase_auth_status` - Check auth status
- `supabase_auth_signup` - Sign up new users

### File Storage
- `supabase_storage_upload` - Upload files
- `supabase_storage_list` - List bucket files

### Real-time Features
- `supabase_realtime_subscribe` - Subscribe to table changes

### Schema Management
- `supabase_create_crm_schema` - Create CRM database schema
- `supabase_get_schema_info` - Get schema information

## 🧪 Testing Strategy

### Basic Connectivity Test
```bash
docker-compose exec supabase-mcp npm test
```

### Test Individual Components
```bash
# Test database access
docker-compose exec supabase-mcp node -e "
import('./test.js').then(m => m.testDatabaseAccess())
"

# Test authentication
docker-compose exec supabase-mcp node -e "
import('./test.js').then(m => m.testAuth())
"
```

### CRM Integration Tests
```bash
# Create test user
docker-compose exec supabase-mcp node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_TOKEN);
// Test operations here
"
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `SUPABASE_TOKEN` | Service role key | Yes | - |
| `LOG_LEVEL` | Logging level | No | info |
| `MCP_SERVER_PORT` | Server port | No | 3030 |
| `NODE_ENV` | Environment | No | development |

### Supabase Project Setup

For full functionality, your Supabase project should have:

1. **Database Access** - Service role key with full permissions
2. **Storage** - Enabled with at least one bucket  
3. **Auth** - Enabled for user management
4. **Real-time** - Enabled for live updates

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Failed
```bash
# Check environment variables
docker-compose exec supabase-mcp env | grep SUPABASE

# Verify URL format
echo $SUPABASE_URL  # Should be https://xxx.supabase.co
```

#### 2. Permission Denied
- Ensure you're using the **service role key**, not anon key
- Check key permissions in Supabase dashboard

#### 3. Schema Creation Failed
- Use Supabase SQL Editor for initial schema setup
- Service role may have limited DDL permissions

#### 4. Storage Access Limited
- Enable Storage in Supabase dashboard
- Create at least one storage bucket

### Debug Commands

```bash
# View detailed logs
docker-compose logs -f supabase-mcp

# Check container health
docker-compose exec supabase-mcp npm run health

# Interactive debugging
docker-compose exec supabase-mcp sh
```

## 📊 Performance Monitoring

### Health Checks
The container includes automatic health checks:
- Runs every 30 seconds
- 3 retry attempts
- 10 second timeout

### Logging
All operations are logged to:
- Console (Docker logs)
- File: `/app/logs/supabase-mcp.log`

### Metrics
Track usage via logs:
```bash
# Tool usage stats
docker-compose logs supabase-mcp | grep "Executing tool"

# Error rates  
docker-compose logs supabase-mcp | grep "ERROR"
```

## 🔗 Integration with Existing MCP Servers

This Supabase MCP server integrates with your existing setup:

- **Port 3030** - Supabase MCP Server
- **Port 3020** - Zen MCP (AI Integration)  
- **Port 3010** - MCP Orchestra
- **Logs** - Shared `/logs` volume

## 📚 Usage Examples

### Create CRM Contact
```javascript
// Tool: crm_create_contact
{
  "email": "john@example.com",
  "firstName": "John", 
  "lastName": "Doe",
  "company": "Acme Corp",
  "userId": "user-123"
}
```

### Query Database
```javascript
// Tool: supabase_query
{
  "table": "contacts",
  "select": "id, firstName, lastName, email",
  "filter": { "status": "ACTIVE" },
  "limit": 10
}
```

### Get Dashboard Analytics
```javascript
// Tool: crm_get_dashboard_data
{
  "userId": "user-123",
  "timeframe": "month"
}
```

## 🎯 Next Steps

1. **Configure SUPABASE_URL** in `.env`
2. **Run initial tests** with `npm test`
3. **Create CRM schema** using `supabase_create_crm_schema`
4. **Start testing CRM operations**
5. **Integrate with your application**

For advanced configuration and custom tools, see the source code in `index.js`.