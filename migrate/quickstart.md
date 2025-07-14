# 🚀 Quick Start Guide - Your Fresh CRM in 30 Minutes

## 🎯 What You're Building

A **modular CRM** that:
- Works identically on all your Windows machines
- Never has database schema issues
- Costs $0 to start (generous free tiers)
- Automates testing and deployment
- Uses AI efficiently (saves tokens)

## 📋 Prerequisites Checklist

```powershell
# 1. Install these on Windows:
- [ ] Docker Desktop: https://www.docker.com/products/docker-desktop/
- [ ] VS Code: https://code.visualstudio.com/
- [ ] Git: https://git-scm.com/download/win
- [ ] Node.js 20+: https://nodejs.org/

# 2. Create free accounts:
- [ ] GitHub: https://github.com (for code)
- [ ] Supabase: https://supabase.com (replaces Firebase/Railway)
- [ ] Vercel: https://vercel.com (for hosting)
- [ ] OpenRouter: https://openrouter.ai (for AI models)
```

## 🏃‍♂️ 30-Minute Setup

### Minute 1-5: Create Project

```powershell
# Open PowerShell as Administrator
cd C:\Projects  # Or wherever you keep code

# Create fresh project
npx create-next-app@latest my-crm --typescript --tailwind --app --src-dir
cd my-crm

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

### Minute 6-10: Set Up Docker Environment

```powershell
# Create Docker structure
mkdir -p .docker/mcp-orchestra .docker/volumes .docker/test-agent
mkdir -p scripts prisma src/modules

# Download our Docker setup files
# (Copy the docker-compose.yml from the Docker guide above)
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  # Supabase PostgreSQL
  postgres:
    image: supabase/postgres:15.1.0.117
    container_name: crm-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: crm
    volumes:
      - .docker/volumes/postgres:/var/lib/postgresql/data

  # Your Next.js app
  app:
    build: .
    container_name: crm-app
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/crm
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - postgres
    command: npm run dev

  # MCP Orchestra (all AI tools)
  mcp:
    build: .docker/mcp-orchestra
    container_name: crm-mcp
    ports:
      - "8080:8080"
    environment:
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
    volumes:
      - .:/workspace
```

### Minute 11-15: Create Core Files

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Create `.env.example`:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/crm

# Supabase (get from dashboard)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# AI (get from OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-

# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

Create `scripts/setup.ps1`:
```powershell
Write-Host "🚀 Setting up CRM..." -ForegroundColor Cyan

# Check Docker
docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker not found!"
    exit 1
}

# Create .env from example
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "📝 Created .env - please add your keys!"
}

# Start services
docker-compose up -d

Write-Host "✅ Setup complete! Open http://localhost:3000"
```

### Minute 16-20: Install Dependencies & Prisma

```powershell
# Install core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install prisma @prisma/client --save-dev
npm install lucide-react clsx tailwind-merge
npm install react-hook-form zod @hookform/resolvers

# Initialize Prisma
npx prisma init
```

Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          String    @default("user")
  
  contacts      Contact[]
  tasks         Task[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Contact {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  firstName     String
  lastName      String
  email         String?
  phone         String?
  company       String?
  
  // All extended fields from day 1!
  avatarUrl     String?
  lifecycleStage String   @default("prospect")
  
  tasks         Task[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([userId])
}

model Task {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  contactId     String?
  contact       Contact?  @relation(fields: [contactId], references: [id])
  
  title         String
  description   String?
  status        String    @default("todo")
  priority      String    @default("medium")
  dueDate       DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([userId])
  @@index([status])
}
```

### Minute 21-25: Create First Migration

```powershell
# Generate migration
docker-compose exec app npx prisma migrate dev --name init

# Generate Prisma Client
docker-compose exec app npx prisma generate

# Open Prisma Studio to see your database
docker-compose exec app npx prisma studio
```

### Minute 26-30: Test Everything

Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Count records
    const users = await prisma.user.count();
    const contacts = await prisma.contact.count();
    const tasks = await prisma.task.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      counts: { users, contacts, tasks },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
```

Test it:
```powershell
# Check health endpoint
curl http://localhost:3000/api/health

# Should return:
# {"status":"healthy","database":"connected","counts":{"users":0,"contacts":0,"tasks":0}}
```

## ✅ You're Done! What You Have:

### 1. **Working Development Environment**
- ✅ Next.js app running at http://localhost:3000
- ✅ PostgreSQL database with Prisma migrations
- ✅ Docker environment that works on any Windows machine
- ✅ Health check endpoint confirming everything works

### 2. **No More Schema Issues**
- ✅ Prisma migrations track every change
- ✅ Single source of truth in schema.prisma
- ✅ Version controlled database changes

### 3. **Ready for MCP Integration**
- ✅ MCP Orchestra container ready
- ✅ Just add your OpenRouter API key
- ✅ All MCP servers will run in Docker

### 4. **Cost: $0**
- ✅ Supabase free tier: 500MB database
- ✅ Vercel free tier: Perfect for Next.js
- ✅ Docker Desktop: Free for personal use

## 🎯 Next Steps

### Day 1: Add Authentication
```powershell
# Use Supabase Auth (replaces Firebase)
npm install @supabase/auth-helpers-nextjs
```

### Day 2: Build Core Features
- Contact CRUD operations
- Task management
- Basic dashboard

### Day 3: Add MCP Servers
- Configure OpenRouter key
- Enable Zen for code reviews
- Add Context7 for documentation

### Day 4: Deploy
```powershell
# Deploy to Vercel
npm install -g vercel
vercel
```

## 🆘 Troubleshooting

### Docker Issues
```powershell
# Reset everything
docker-compose down -v
docker-compose up --build
```

### Database Issues
```powershell
# Reset database
docker-compose exec app npx prisma migrate reset
```

### Port Conflicts
```powershell
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # If 3000 is taken
```

## 📚 Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js 14 Docs**: https://nextjs.org/docs
- **Docker Docs**: https://docs.docker.com

---

**Congratulations! You have a working CRM foundation with no schema nightmares!** 🎉

From here, every feature you add will:
- Work on all your machines
- Have proper migrations
- Be tested automatically
- Deploy with confidence

No more "works on my machine" ever again! 🚀