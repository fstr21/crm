# 🚀 Local Development Setup (No Docker)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Redis installed locally (for rate limiting)
- Supabase CLI installed globally: `npm install -g supabase`

## Quick Start

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/yourusername/crm.git
cd crm
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual values
```

### 3. Start Supabase Locally
```bash
# Initialize Supabase (first time only)
supabase init

# Start local Supabase stack
npm run supabase:start

# Check status
npm run supabase:status
```

### 4. Database Setup
```bash
# Apply migrations
npm run db:migrate

# Generate TypeScript types
npm run db:types

# Optional: Seed database
npm run db:seed
```

### 5. Start Redis (separate terminal)
```bash
# Windows (if Redis is installed)
redis-server

# Alternative: Use Redis Docker container
docker run -d -p 6379:6379 redis:7-alpine
```

### 6. Start Development Server
```bash
npm run dev
```

## Local URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Next.js app |
| Supabase Studio | http://localhost:54323 | Database management |
| Supabase API | http://localhost:54321 | REST API |
| Redis | localhost:6379 | Rate limiting |

**✅ Status Check:** Your application is now running on http://localhost:3000

## MCP Servers Setup

### Start MCP Servers Manually
```bash
# Terminal 1: Zen MCP (if available)
cd mcp-servers/zen
npm start

# Terminal 2: Filesystem MCP
npx @modelcontextprotocol/server-filesystem C:\Users\fstr2\Desktop\crm

# Terminal 3: Supabase MCP (if available)
cd mcp-servers/supabase
npm start
```

### MCP Configuration
Create `.mcp.json` in project root:
```json
{
  "tools": {
    "zen": { "type": "http", "url": "http://localhost:3020" },
    "filesystem": { "type": "http", "url": "http://localhost:4001" },
    "supabase": { "type": "http", "url": "http://localhost:3030" }
  }
}
```

## Development Workflow

### Daily Development
```bash
# 1. Start Supabase
npm run supabase:start

# 2. Start Redis
redis-server

# 3. Start dev server
npm run dev

# 4. Start MCP servers (if needed)
# See MCP section above
```

### Database Management
```bash
# View database in browser
npm run supabase:status  # Get Studio URL

# Reset database
npm run supabase:reset

# Apply schema changes
npm run db:migrate

# Update TypeScript types
npm run db:types
```

### Testing
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:ci

# Run real integration tests
npm run test:real
```

## Environment Variables

Required variables in `.env.local`:

```env
# Supabase (from supabase status)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# Redis
REDIS_URL=redis://localhost:6379

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key

# MCP Servers
OPENROUTER_API_KEY=sk-or-v1-your-key
GITHUB_TOKEN=ghp_your-token
```

## Troubleshooting

### Supabase Issues
```bash
# Check Supabase status
npm run supabase:status

# Restart Supabase
npm run supabase:stop
npm run supabase:start
```

### Redis Issues
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis manually
redis-server
```

### Port Conflicts
- Next.js: 3000 (default)
- Supabase API: 54321
- Supabase Studio: 54323
- Redis: 6379
- MCP Servers: 3020, 3030, 4001

### Database Connection Issues
1. Ensure Supabase is running: `npm run supabase:status`
2. Check connection string in `.env.local`
3. Verify database exists and has proper schema

## Production Deployment

For production, use your actual Supabase project:

```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

Deploy to Vercel or your preferred platform with these environment variables configured.