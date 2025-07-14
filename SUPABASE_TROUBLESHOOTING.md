# Supabase CRM Schema Deployment & Troubleshooting Guide

## Overview
This guide provides solutions for common Supabase deployment issues and explains how to properly access Supabase services.

## Current Schema Conflict Resolution

### Problem: `ERROR: 42P07: relation "contacts" already exists`

**Root Cause**: Existing basic contacts table conflicts with comprehensive CRM schema deployment.

**Solution**: Use the provided migration scripts for safe schema upgrade:

1. **Safe Migration** (Preserves existing data):
   ```sql
   -- Run: migration_strategy.sql
   -- This backs up existing data and upgrades table structure
   ```

2. **Complete Deployment** (Fresh start):
   ```sql
   -- Run: complete_crm_deployment.sql
   -- This handles backup, drops tables, and creates comprehensive schema
   ```

## Supabase URL Access Issue

### Problem: `{"error":"requested path is invalid"}`

**Root Cause**: Direct browser access to Supabase API URL without proper endpoint.

**Correct Supabase Access Methods**:

1. **Dashboard Access**:
   ```
   https://app.supabase.com/project/[PROJECT_ID]
   ```

2. **API Endpoints**:
   ```
   # REST API
   https://[PROJECT_ID].supabase.co/rest/v1/[table_name]
   
   # GraphQL
   https://[PROJECT_ID].supabase.co/graphql/v1
   
   # Auth
   https://[PROJECT_ID].supabase.co/auth/v1
   ```

3. **Database Connection**:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
   ```

### Common URL Issues:

- ❌ `https://[PROJECT_ID].supabase.co/` (Invalid - no endpoint)
- ✅ `https://[PROJECT_ID].supabase.co/rest/v1/contacts` (Valid REST endpoint)
- ✅ `https://app.supabase.com/project/[PROJECT_ID]` (Valid dashboard)

## Migration Best Practices

### 1. Data Backup Strategy
```sql
-- Always backup before migration
CREATE TABLE contacts_backup_YYYYMMDD AS SELECT * FROM public.contacts;
```

### 2. Schema Validation
```sql
-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contacts' AND table_schema = 'public';
```

### 3. Data Verification
```sql
-- Verify data integrity after migration
SELECT COUNT(*) as total_records,
       COUNT(DISTINCT email) as unique_emails,
       COUNT(CASE WHEN first_name IS NULL THEN 1 END) as missing_first_names
FROM public.contacts;
```

## Deployment Steps

### Step 1: Prepare Environment
```bash
# Ensure you have Supabase CLI installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [PROJECT_ID]
```

### Step 2: Run Migration
```bash
# Option A: Safe migration (preserves data)
supabase db reset --file migration_strategy.sql

# Option B: Complete deployment (fresh start)
supabase db reset --file complete_crm_deployment.sql
```

### Step 3: Verify Deployment
```sql
-- Check all tables created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify data
SELECT 'contacts' as table_name, COUNT(*) as record_count FROM public.contacts
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM public.users
UNION ALL
SELECT 'tasks' as table_name, COUNT(*) as record_count FROM public.tasks
UNION ALL
SELECT 'activities' as table_name, COUNT(*) as record_count FROM public.activities;
```

## Common Issues & Solutions

### Issue 1: Foreign Key Constraints
**Problem**: `ERROR: insert or update on table "contacts" violates foreign key constraint`

**Solution**:
```sql
-- Temporarily disable triggers for data migration
SET session_replication_role = replica;
-- Run your migration
SET session_replication_role = DEFAULT;
```

### Issue 2: Permission Denied
**Problem**: `ERROR: permission denied for table contacts`

**Solution**:
```sql
-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### Issue 3: Row Level Security Blocks
**Problem**: Queries return no results due to RLS

**Solution**:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
```

## Environment Configuration

### Required Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# Database Configuration
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
```

### Connection String Format
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres?sslmode=require
```

## Testing Connection

### 1. CLI Test
```bash
# Test connection
supabase db ping

# Run SQL directly
supabase db sql --file complete_crm_deployment.sql
```

### 2. Application Test
```javascript
// Test Supabase client connection
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Test query
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .limit(5)

if (error) {
  console.error('Connection error:', error)
} else {
  console.log('Connected successfully:', data)
}
```

## Schema Upgrade Summary

### Before (Basic Schema)
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### After (Comprehensive CRM Schema)
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    -- Basic fields (8 original + enhanced)
    first_name, last_name, full_name, company_name, job_title, email, phone, mobile, website,
    -- Address fields (5 new)
    street_address, city, state, postal_code, country,
    -- CRM fields (4 new)
    contact_status, lead_source, lead_score, lifecycle_stage,
    -- Relationship fields (3 new)
    assigned_to, tags, notes,
    -- Social media (2 new)
    linkedin_url, twitter_handle,
    -- Business info (3 new)
    annual_revenue, employee_count, industry,
    -- System fields (enhanced)
    created_by, created_at, updated_at
);
```

## Success Verification

After deployment, you should see:
- ✅ 5 tables created (users, contacts, tasks, activities, contact_relationships)
- ✅ 30+ indexes for performance
- ✅ Row Level Security enabled
- ✅ Automatic timestamp triggers
- ✅ Data integrity constraints
- ✅ Existing data preserved and enhanced

## Next Steps

1. **Configure Authentication**: Set up proper user authentication
2. **Update Application**: Modify connection strings and queries
3. **Test Functionality**: Verify all CRM features work correctly
4. **Deploy to Production**: Roll out the enhanced schema

## Emergency Rollback

If issues occur, restore from backup:
```sql
-- Find backup table
SELECT tablename FROM pg_tables WHERE tablename LIKE 'contacts_backup_%';

-- Restore data
INSERT INTO public.contacts (first_name, last_name, company_name, email, phone, created_at, updated_at)
SELECT first_name, last_name, company, email, phone, created_at, updated_at
FROM contacts_backup_[TIMESTAMP];
```