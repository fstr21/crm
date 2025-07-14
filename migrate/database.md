# 🗄️ Database Migration Strategy - Never Again Schema Mismatches

## 🚨 Your Previous Schema Nightmare (What We're Fixing)

From your CLAUDE.md, you had:
- **Missing columns** in production (`mfa_enabled`, `avatar_url`, etc.)
- **Wrong data types** (`mfa_enabled` was boolean, needed jsonb)
- **Enum mismatches** (status `'pending'` vs `'todo'`)
- **Hours of debugging** 500 errors in production

**Root Cause**: No proper migration system, manual database changes, schema drift between environments.

## ✅ The Solution: Prisma Migrations

### Why Prisma Over Drizzle?
- **Better migration tracking** - Every change is versioned
- **Windows-friendly** - No Unix-specific issues
- **Visual migration history** - See exactly what changed
- **Automatic rollback** - Undo migrations safely
- **Schema drift detection** - Warns about mismatches

## 📋 Migration Workflow

### 1. **Initial Setup**

#### `prisma/schema.prisma`
```prisma
// This is your single source of truth
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model with all fields from day 1
model User {
  id              String    @id @default(cuid())
  firebaseUid     String    @unique
  email           String    @unique
  name            String?
  role            UserRole  @default(USER)
  
  // MFA fields - structured properly from the start
  mfaEnabled      Boolean   @default(false)
  mfaSecret       String?
  backupCodes     Json?     // Stores array of backup codes
  lastMfaAt       DateTime?
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  
  // Relations
  contacts        Contact[]
  tasks           Task[]
  activities      Activity[]
  
  @@map("users")
}

// Contact model with ALL fields
model Contact {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Basic info
  firstName       String
  lastName        String
  email           String?
  phone           String?
  company         String?
  position        String?
  
  // Extended profile (no more missing columns!)
  avatarUrl       String?
  birthday        DateTime?
  website         String?
  linkedinUrl     String?
  twitterHandle   String?
  facebookUrl     String?
  instagramHandle String?
  
  // Address
  address         String?
  city            String?
  state           String?
  zipCode         String?
  country         String?
  timeZone        String?
  
  // CRM specific
  lifecycleStage  LifecycleStage @default(PROSPECT)
  source          String?
  customFields    Json?
  tags            String[]
  notes           String?   @db.Text
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastContactedAt DateTime?
  
  // Relations
  tasks           Task[]
  activities      Activity[]
  
  @@index([userId])
  @@index([email])
  @@index([lifecycleStage])
  @@map("contacts")
}

// Task model with time tracking
model Task {
  id                  String    @id @default(cuid())
  userId              String
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  contactId           String?
  contact             Contact?  @relation(fields: [contactId], references: [id], onDelete: SetNull)
  
  // Task details
  title               String
  description         String?   @db.Text
  status              TaskStatus @default(TODO)
  priority            Priority   @default(MEDIUM)
  category            String?
  tags                String[]
  
  // Dates and time tracking
  dueDate             DateTime?
  completedAt         DateTime?
  estimatedHours      Float?
  actualHours         Float?
  lastStatusChange    DateTime  @default(now())
  
  // Recurrence
  recurrence          Json?     // Stores recurrence pattern
  recurrenceTemplateId String?
  nextDueDate         DateTime?
  isTemplate          Boolean   @default(false)
  
  // Timestamps
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([dueDate])
  @@map("tasks")
}

// Enums defined properly
enum UserRole {
  ADMIN
  MANAGER
  USER
  READONLY
}

enum TaskStatus {
  TODO      // Not 'pending' - matching your code
  IN_PROGRESS
  IN_REVIEW
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum LifecycleStage {
  PROSPECT
  LEAD
  OPPORTUNITY
  CUSTOMER
  INACTIVE
}
```

### 2. **Migration Commands**

```powershell
# First time setup - create initial migration
docker-compose exec app npx prisma migrate dev --name init

# When you add/change fields
docker-compose exec app npx prisma migrate dev --name add_contact_social_fields

# Deploy to production (applies all pending migrations)
docker-compose exec app npx prisma migrate deploy

# Check migration status
docker-compose exec app npx prisma migrate status

# Create migration without applying (for review)
docker-compose exec app npx prisma migrate dev --create-only
```

### 3. **Development Workflow**

#### Step 1: Make Schema Changes
```prisma
// Add new field to Contact model
model Contact {
  // ... existing fields ...
  
  // New field
  preferredContactMethod String? // Added in sprint 3
}
```

#### Step 2: Create Migration
```powershell
# This creates a SQL file you can review
docker-compose exec app npx prisma migrate dev --name add_preferred_contact_method
```

#### Step 3: Review Generated SQL
```sql
-- prisma/migrations/20240713_add_preferred_contact_method/migration.sql
ALTER TABLE "contacts" ADD COLUMN "preferredContactMethod" TEXT;
```

#### Step 4: Test Locally
```powershell
# Migration auto-applies in dev
# Test your app to ensure it works
```

#### Step 5: Commit to Git
```powershell
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add preferred contact method to contacts"
git push
```

### 4. **Production Deployment**

#### Automated Deployment Script
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          # CRITICAL: Run migrations BEFORE deploying new code
          npx prisma migrate deploy
          
          # Then deploy the application
          npm run deploy
```

#### Manual Deployment Checklist
```powershell
# 1. Check pending migrations
npx prisma migrate status

# 2. Backup production database
pg_dump $PROD_DATABASE_URL > backup-$(date +%Y%m%d).sql

# 3. Apply migrations
npx prisma migrate deploy

# 4. Deploy new code
npm run deploy

# 5. Verify schema
npx prisma db pull
npx prisma validate
```

## 🛡️ Preventing Schema Drift

### 1. **Schema Validation in CI/CD**
```yaml
# Run on every PR
- name: Validate Schema
  run: |
    npx prisma validate
    npx prisma format --check
```

### 2. **Environment Parity Check**
```powershell
# Script to compare schemas
# scripts/check-schema-drift.ps1

$dev = docker-compose exec app npx prisma db pull --print
$prod = npx prisma db pull --print --url $PROD_DATABASE_URL

if ($dev -ne $prod) {
    Write-Error "❌ Schema drift detected!"
    exit 1
}
```

### 3. **Migration Safety Rules**

#### ✅ DO:
- Always create migrations for schema changes
- Test migrations locally first
- Review generated SQL
- Keep migrations small and focused
- Name migrations descriptively

#### ❌ DON'T:
- Never modify production schema manually
- Don't edit existing migrations
- Don't skip migrations in any environment
- Don't use `prisma db push` in production

## 🔄 Recovery Procedures

### If Schema Drift Happens Again

#### 1. **Detect the Drift**
```powershell
# Pull production schema
npx prisma db pull --url $PROD_DATABASE_URL --schema ./prisma/prod.prisma

# Compare with expected schema
diff prisma/schema.prisma prisma/prod.prisma
```

#### 2. **Create Repair Migration**
```powershell
# Baseline from production
npx prisma migrate diff \
  --from-schema-datasource prisma/prod.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > repair.sql

# Review and apply
psql $PROD_DATABASE_URL -f repair.sql
```

#### 3. **Reset Migration History**
```sql
-- Mark migrations as applied without running them
INSERT INTO _prisma_migrations (migration_name, finished_at)
VALUES ('20240713_repair_schema_drift', NOW());
```

## 📊 Migration Best Practices

### 1. **Naming Conventions**
```
YYYYMMDD_description
20240713_add_contact_social_fields
20240714_add_task_time_tracking
20240715_create_activity_log
```

### 2. **Safe Column Additions**
```prisma
// Always add nullable or with default
newField String?  // Nullable
status String @default("active")  // With default
```

### 3. **Data Migrations**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Migrate existing data after schema change
  await prisma.$executeRaw`
    UPDATE contacts 
    SET lifecycle_stage = 'PROSPECT' 
    WHERE lifecycle_stage IS NULL
  `
}
```

### 4. **Testing Migrations**
```typescript
// tests/migrations.test.ts
describe('Migration Tests', () => {
  it('should handle null values in new columns', async () => {
    const contacts = await prisma.contact.findMany()
    expect(contacts.every(c => c.avatarUrl === null)).toBe(true)
  })
})
```

## 🎯 Migration Monitoring

### Dashboard Queries
```sql
-- Check migration status
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC;

-- Find missing columns (should return empty)
SELECT 
  table_name,
  column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('users', 'contacts', 'tasks')
ORDER BY table_name, ordinal_position;

-- Check for enum mismatches
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('TaskStatus', 'Priority', 'LifecycleStage')
ORDER BY enum_name, e.enumsortorder;
```

## 🚀 Quick Reference

### Common Commands
```powershell
# Dev workflow
npx prisma migrate dev              # Create and apply migration
npx prisma studio                   # Visual database editor
npx prisma validate                 # Check schema syntax
npx prisma format                   # Format schema file

# Production
npx prisma migrate deploy           # Apply pending migrations
npx prisma migrate status          # Check migration status
npx prisma db seed                 # Run seed script

# Debugging
npx prisma migrate diff            # Compare schemas
npx prisma db pull                 # Pull schema from database
npx prisma migrate resolve         # Mark migration as applied
```

---

With this migration strategy, you'll NEVER have schema mismatches again! 🎉