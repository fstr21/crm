# Docker CRM Setup - Complete Implementation Plan

*Generated from Claude conversation - July 14, 2025*

## What We're Building

A fully automated CRM development environment that eliminates:
- Works on my machine problems
- Manual schema migrations
- Claude crashing issues  
- Token waste on repetitive tasks
- Inconsistent environments across machines

## Docker: Your Consistency Solution

### The Problem (Before Docker):
Home PC:           Laptop:           Production:
- Windows paths    - Different paths  - Linux paths  
- Python 3.10      - Python 3.11     - Python 3.9
- Node 18          - Node 20          - Node 16
- MCP conflicts    - Different MCPs   - No MCPs

### The Solution (With Docker):
Every Machine Gets Identical Environment:
- Ubuntu Linux (same everywhere)
- Node 20 (exact version)
- Python 3.11 (exact version)
- All MCP servers (pre-configured)
- Database (PostgreSQL)
- Your CRM app

## Automated Workflow Overview

Feature Request → Research (Zen+Context7) → Planning → Implementation → Testing (Real Data) → Deployment

### Workflow Phases:

1. Research Phase (2-3 minutes)
   - Zen Gemini analyzes your current architecture
   - Context7 finds documentation and patterns
   - Comprehensive research document created

2. Planning Phase (1-2 minutes)  
   - Creates detailed PLAN.md
   - Database changes needed
   - API endpoints to create
   - Frontend components required
   - Test scenarios

3. Implementation (5-10 minutes)
   - Zen Gemini Flash generates code (cheap tokens)
   - Database migrations created
   - React components built
   - Test files written

4. Testing (Real Data\!)
   - Runs actual tests in Docker
   - Uses real PostgreSQL database
   - Tests actual API calls
   - Validates data creation
   - NO MOCKS - everything real\!

5. Automatic Fixing
   - AI analyzes real errors
   - Generates fixes automatically
   - Applies fixes to code
   - Re-runs tests until 95% confidence

## Multi-Machine Setup

On ANY machine (Home PC, Laptop, etc.):
1. git clone https://github.com/yourusername/crm.git
2. cd crm
3. docker-compose up
4. Access: App at localhost:3001, Database at localhost:8080

What Gets Synchronized:
- Code: Git keeps files in sync
- Environment: Docker keeps software versions identical
- Database Schema: Prisma migrations keep DB structure identical
- MCP Servers: All containerized, same configuration
- Dependencies: package.json locks exact versions

## Token Cost Savings (70%+ reduction)

Task Type              Before        After           Savings
Research & Analysis    Claude        Gemini Pro      4x cheaper
Code Generation        Claude        Gemini Flash    8x cheaper  
Testing & Fixes        Claude        GPT-3.5         6x cheaper
Critical Decisions     Claude        Claude          Same

## Implementation Checklist

### COMPLETED (Current Status):
- [x] Docker directory structure created
- [x] Basic docker-compose.yml working
- [x] PostgreSQL container running (port 5432)
- [x] Redis container running (port 6379)
- [x] Test database running (port 5433)
- [x] Environment files configured

### IN PROGRESS - Next Steps:

#### Phase 1: Foundation (Today)
- [ ] Create Next.js 14 application structure
- [ ] Set up Supabase local development
- [ ] Configure Prisma with automated migrations
- [ ] Basic CRUD operations working
- [ ] App container building and running

#### Phase 2: Core CRM (This Week)  
- [ ] Contact management system
- [ ] Task system
- [ ] User authentication with Supabase
- [ ] Basic dashboard
- [ ] All with proper migrations

#### Phase 3: Automation Magic (Next Week)
- [ ] MCP Orchestra container (all servers)
- [ ] Automated test agent (real data)
- [ ] Workflow orchestrator
- [ ] VS Code integration
- [ ] Dashboard for monitoring

#### Phase 4: Production Ready (Week 4)
- [ ] Deploy to Vercel/Supabase
- [ ] Performance optimization  
- [ ] Security hardening
- [ ] Documentation

## Daily Workflow (Once Complete)

Morning:
cd crm
./scripts/dev.ps1  # Everything starts automatically

Feature Development:
You: Add invoice management
Claude: [Automated workflow runs for 10 minutes]
Claude: Feature complete\! 47 tests passing, database updated, ready to use

Evening:
git add .
git commit -m feat: invoice management
git push
docker-compose down

## Quick Commands Reference

Daily Development:
docker-compose up                    # Start everything
docker-compose up -d                 # Start in background
docker-compose logs -f               # View logs
docker-compose down                  # Stop everything
docker-compose down -v               # Fresh start (reset database)

Database Operations:
docker-compose exec app npx prisma migrate dev    # Run migrations
# Go to: http://localhost:8080                    # Database admin
docker-compose exec app npx prisma studio         # Prisma Studio

Testing:
docker-compose exec app npm test                  # Run tests
docker-compose exec app npm run test:real         # Tests with real data
python scripts/test-agent.py feature description  # Automated test agent

## Current Docker Setup

Services Running:
- PostgreSQL (port 5432) - Main database
- Redis (port 6379) - Caching and queues
- PostgreSQL Test (port 5433) - Test database
- Redis Test (port 6380) - Test cache

Services To Add:
- CRM App (port 3001) - Next.js application
- MCP Orchestra (port 8080) - All MCP servers
- Workflow Dashboard (port 8090) - Automation monitoring
- Test Agent (background) - Automated testing

## Success Metrics

You'll know it's working when:
- Clone repo on any machine → docker-compose up → it works
- No manual database fixes ever again
- Features implement automatically with real testing
- Token costs reduced by 70%+
- Development time cut by 80%
- Claude stops crashing (everything containerized)

## Emergency Recovery

If something breaks:

Docker Issues:
docker-compose down -v
docker system prune -f
docker-compose up --build

Database Issues:
docker-compose stop postgres
docker volume rm crm_postgres_data
docker-compose up postgres

MCP Issues:
docker-compose restart mcp-orchestra

## Next Immediate Steps

1. Right Now: Create Next.js app structure
2. Today: Get app container building and running  
3. This Week: Core CRM features working
4. Next Week: Full automation pipeline

Ready to continue with Next.js setup\!

*This document will be updated as we progress through implementation.*
