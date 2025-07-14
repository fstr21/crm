# Supabase MCP Server Setup Guide

## Overview

This guide will help you set up and test the Supabase MCP server for your CRM project evaluation.

## What's Included

✅ **Complete MCP Server Implementation**
- Node.js-based MCP server with Supabase integration
- 30+ tools for database operations, CRM management, auth, storage, and real-time features
- Comprehensive error handling and logging
- Production-ready Docker configuration

✅ **CRM-Specific Features**
- Automated schema creation matching your Prisma models
- User, contact, task, and activity management tools
- Dashboard data aggregation
- Contact search and filtering
- Activity logging and tracking

✅ **Testing & Validation**
- Basic connectivity and access verification tests
- Health checks for monitoring
- Error handling validation
- Tool discovery and routing tests

## Quick Start

### 1. Update Supabase Configuration

Your Supabase token is already configured in:
```
.docker/supabase-mcp/.env
```

If you need to use a different project, update:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your anon/public key  
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key

### 2. Build and Start the Container

```bash
# Build and start Supabase MCP server
docker-compose up --build supabase-mcp

# Or run in background
docker-compose up -d supabase-mcp
```

### 3. Verify Everything is Working

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs supabase-mcp

# Run connectivity tests
docker-compose exec supabase-mcp npm test

# Check health status
docker-compose exec supabase-mcp npm run health
```

## Testing Your Supabase Account

The test suite will verify:

🔌 **Connection Tests**
- Basic Supabase connectivity
- Client initialization
- API accessibility

🔑 **Account Access Tests**  
- Authentication system access
- Storage bucket access
- Service permissions

⚙️ **Basic Functionality Tests**
- Tool discovery (30+ tools available)
- CRM schema creation
- Database operations (insert/query)

Expected output:
```
🚀 Starting Supabase MCP Basic Tests

📦 Initializing components...
✅ Components initialized successfully

🔌 Running connection tests...
  ✅ Supabase Connection - Connected successfully
  ✅ Client Initialization - Clients initialized correctly

🔑 Running account access tests...
  ✅ Auth Status Check - Auth accessible: true
  ✅ Storage Access - Storage accessible: X bucket(s)

⚙️ Running basic functionality tests...
  ✅ Tool Discovery - Discovered 30+ tools
  ✅ CRM Schema Setup - Created CRM schema with 4 tables
  ✅ Basic Database Operation - Database operations working (inserted user: test-xxx@example.com)

📊 Test Results Summary
========================
✅ Passed: 7
❌ Failed: 0
📊 Total: 7

🎉 All tests passed! Supabase MCP server is working correctly.
```

## Available Tools for Testing

### Database Operations
```bash
# Query data
docker-compose exec supabase-mcp node -e "
const tools = require('./tools/database-tools.js');
// Use supabase_query, supabase_insert, etc.
"
```

### CRM Operations
```bash
# Create test data
docker-compose exec supabase-mcp node -e "
// Use crm_create_user, crm_create_contact, crm_create_task
"
```

### Real-time Features
```bash
# Test subscriptions
docker-compose exec supabase-mcp node -e "
// Use supabase_realtime_subscribe, supabase_realtime_list_subscriptions
"
```

## Integration with Your CRM

The MCP server provides tools that map directly to your CRM needs:

**User Management**: `crm_create_user`, `crm_update_user`
**Contact Management**: `crm_create_contact`, `crm_search_contacts`, `crm_update_contact`  
**Task Management**: `crm_create_task`, task queries and updates
**Activity Tracking**: `crm_log_activity`, activity queries
**Dashboard Data**: `crm_get_dashboard_data` for metrics and recent activities

## Configuration Options

In `.docker/supabase-mcp/.env`:

```env
# Performance tuning
MAX_QUERY_LIMIT=1000          # Max rows per query
RATE_LIMIT_RPM=100           # Rate limiting

# Security
ENABLE_AUTH_TESTING=true     # Enable auth testing tools

# Logging
LOG_LEVEL=info               # debug, info, warn, error
```

## Next Steps for Evaluation

1. **Performance Testing**
   - Compare query speeds vs Railway PostgreSQL
   - Test with realistic data volumes
   - Measure real-time feature latency

2. **Feature Evaluation**
   - Test real-time subscriptions for live updates
   - Evaluate file storage capabilities
   - Compare auth features vs current implementation

3. **Migration Planning**
   - Schema compatibility verification
   - Data migration strategy
   - Feature parity assessment

## Monitoring & Debugging

**Logs Location**: `./logs/supabase-mcp*.log`

**Health Check**: `http://localhost:3030` (if exposed)

**Common Issues**:
- Connection errors: Check Supabase credentials and project status
- Permission errors: Verify service role key permissions
- Rate limiting: Adjust RPM limits in configuration

## Support

The implementation includes:
- Comprehensive error handling
- Detailed logging for debugging  
- Input validation on all operations
- Graceful fallbacks for optional features

All tools follow MCP standards and include proper error responses for integration debugging.

---

**Status**: ✅ Ready for testing and evaluation
**Tools Available**: 30+ CRM and Supabase tools
**Docker Integration**: ✅ Fully integrated with existing containers  
**Testing**: ✅ Basic connectivity verification included