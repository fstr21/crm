# 🐳 Docker Development Environment - Complete Setup

## 📋 Prerequisites (Windows)

### 1. **Install Docker Desktop**
```powershell
# Download from: https://www.docker.com/products/docker-desktop/
# During installation:
# ✅ Use WSL 2 backend (it's just for Docker, not your code)
# ✅ Enable Docker Compose V2
```

### 2. **Install VS Code + Extensions**
```powershell
# Install these VS Code extensions:
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-vscode-remote.remote-containers
code --install-extension bradlc.vscode-tailwindcss
code --install-extension prisma.prisma
```

### 3. **Install Git for Windows**
```powershell
# Download from: https://git-scm.com/download/win
# Use default settings
```

## 🏗️ Project Structure

```
my-crm/
├── docker-compose.yml          # Main orchestration
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.test.yml     # Test environment
├── Dockerfile                  # App container
├── .docker/
│   ├── mcp-orchestra/         # MCP servers setup
│   │   ├── Dockerfile
│   │   ├── servers.json
│   │   └── config/
│   ├── scripts/               # Helper scripts
│   │   ├── wait-for-it.sh
│   │   └── init-db.sh
│   └── volumes/               # Persistent data
│       ├── postgres/
│       ├── redis/
│       └── mcp-data/
├── .env.example               # Environment template
├── .env                       # Local environment (gitignored)
└── .gitignore
```

## 📄 Main Docker Compose Configuration

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  # Supabase Local Stack
  postgres:
    image: supabase/postgres:15.1.0.117
    container_name: crm-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-crm}
    volumes:
      - .docker/volumes/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  supabase-studio:
    image: supabase/studio:latest
    container_name: crm-supabase-studio
    ports:
      - "3000:3000"
    environment:
      STUDIO_PG_META_URL: http://postgres:8080
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      SUPABASE_URL: http://supabase-kong:8000
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
    depends_on:
      - postgres

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: crm-app
    ports:
      - "3001:3000"  # Next.js
      - "5555:5555"  # Prisma Studio
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-crm}
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      NODE_ENV: development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev

  # MCP Orchestra - All MCP servers in one container
  mcp-orchestra:
    build:
      context: .docker/mcp-orchestra
      dockerfile: Dockerfile
    container_name: crm-mcp-orchestra
    ports:
      - "8080:8080"  # MCP management UI
    environment:
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-crm}
    volumes:
      - .docker/volumes/mcp-data:/data
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - postgres

  # Redis for caching and queues
  redis:
    image: redis:7-alpine
    container_name: crm-redis
    ports:
      - "6379:6379"
    volumes:
      - .docker/volumes/redis:/data
    command: redis-server --appendonly yes

  # Test Environment Database
  postgres-test:
    image: supabase/postgres:15.1.0.117
    container_name: crm-postgres-test
    ports:
      - "5433:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: crm_test
    volumes:
      - .docker/volumes/postgres-test:/var/lib/postgresql/data
    profiles:
      - test

networks:
  default:
    name: crm-network
```

## 🎭 Development Overrides

### `docker-compose.dev.yml`
```yaml
version: '3.8'

services:
  app:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      NODE_ENV: development
      NEXT_TELEMETRY_DISABLED: 1
    command: npm run dev

  # Development tools
  mailhog:
    image: mailhog/mailhog
    container_name: crm-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

  # Database admin
  adminer:
    image: adminer
    container_name: crm-adminer
    ports:
      - "8081:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
```

## 🧪 Test Environment

### `docker-compose.test.yml`
```yaml
version: '3.8'

services:
  app-test:
    build:
      context: .
      target: test
    container_name: crm-app-test
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres-test:5432/crm_test
      NODE_ENV: test
    depends_on:
      - postgres-test
    command: npm run test:ci

  test-runner:
    build:
      context: .docker/test-runner
      dockerfile: Dockerfile
    container_name: crm-test-runner
    volumes:
      - ./test-results:/results
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      TEST_DATABASE_URL: postgresql://postgres:postgres@postgres-test:5432/crm_test
```

## 🐋 Application Dockerfile

### `Dockerfile`
```dockerfile
# syntax=docker/dockerfile:1

# Base stage with dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci

# Development stage
FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000 5555
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# Test stage
FROM base AS test
COPY . .
RUN npm run build
CMD ["npm", "run", "test"]
```

## 🤖 MCP Orchestra Setup

### `.docker/mcp-orchestra/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /mcp

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install MCP servers
RUN npm install -g \
    @modelcontextprotocol/server-filesystem \
    @modelcontextprotocol/server-github \
    @modelcontextprotocol/server-memory \
    @modelcontextprotocol/server-postgres \
    @missionsquad/mcp-server-ollama

# Install Python-based MCPs
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy configuration
COPY servers.json .
COPY config/ ./config/
COPY scripts/ ./scripts/

# MCP management script
COPY manage-mcp.py .

EXPOSE 8080

CMD ["python", "manage-mcp.py"]
```

### `.docker/mcp-orchestra/servers.json`
```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/workspace"],
      "env": {
        "WORKSPACE_PATH": "/workspace"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_PATH": "/data/memory"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "zen": {
      "command": "python",
      "args": ["/mcp/zen-server/server.py"],
      "env": {
        "OPENROUTER_API_KEY": "${OPENROUTER_API_KEY}",
        "DEFAULT_MODEL": "auto"
      }
    }
  }
}
```

## 🔧 Environment Configuration

### `.env.example`
```bash
# Database
POSTGRES_PASSWORD=postgres
POSTGRES_DB=crm

# Supabase
SUPABASE_URL=http://localhost:3000
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001
JWT_SECRET=your-super-secret-jwt-key

# MCP Servers
OPENROUTER_API_KEY=sk-or-v1-your-key
GITHUB_TOKEN=ghp_your-token
OPENAI_API_KEY=sk-your-key

# Development
LOG_LEVEL=debug
```

## 🚀 PowerShell Setup Scripts

### `scripts/setup.ps1`
```powershell
# CRM Docker Setup Script for Windows

Write-Host "🚀 CRM Docker Setup" -ForegroundColor Cyan

# Check Docker Desktop
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Desktop not found. Please install from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Desktop is not running. Please start it and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker Desktop is running" -ForegroundColor Green

# Create directories
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
$directories = @(
    ".docker/volumes/postgres",
    ".docker/volumes/postgres-test",
    ".docker/volumes/redis",
    ".docker/volumes/mcp-data",
    ".docker/mcp-orchestra/config",
    ".docker/mcp-orchestra/scripts",
    "prisma/migrations",
    "scripts",
    "test-results"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Copy environment file
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit .env with your API keys" -ForegroundColor Yellow
}

# Pull Docker images
Write-Host "🐳 Pulling Docker images..." -ForegroundColor Yellow
docker-compose pull

# Build custom images
Write-Host "🔨 Building custom images..." -ForegroundColor Yellow
docker-compose build

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your API keys"
Write-Host "2. Run: docker-compose up"
Write-Host "3. Open: http://localhost:3001"
```

### `scripts/dev.ps1`
```powershell
# Development startup script

param(
    [switch]$Fresh,
    [switch]$Test,
    [switch]$Logs
)

Write-Host "🚀 Starting CRM Development Environment" -ForegroundColor Cyan

if ($Fresh) {
    Write-Host "🧹 Cleaning volumes..." -ForegroundColor Yellow
    docker-compose down -v
}

if ($Test) {
    Write-Host "🧪 Starting with test environment..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml up -d
} else {
    Write-Host "💻 Starting development environment..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
}

if ($Logs) {
    docker-compose logs -f
} else {
    Write-Host "✅ Environment started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs:" -ForegroundColor Cyan
    Write-Host "- App: http://localhost:3001"
    Write-Host "- Supabase Studio: http://localhost:3000"
    Write-Host "- Adminer: http://localhost:8081"
    Write-Host "- MailHog: http://localhost:8025"
    Write-Host "- MCP Orchestra: http://localhost:8080"
    Write-Host ""
    Write-Host "Run 'docker-compose logs -f' to see logs"
}
```

## 🎯 Daily Workflow

### 1. **Start Development**
```powershell
# First time
./scripts/setup.ps1

# Daily
./scripts/dev.ps1

# Fresh start (reset database)
./scripts/dev.ps1 -Fresh
```

### 2. **Access Services**
- **Your App**: http://localhost:3001
- **Supabase Studio**: http://localhost:3000
- **Database Admin**: http://localhost:8081
- **Email Testing**: http://localhost:8025
- **MCP Dashboard**: http://localhost:8080

### 3. **Database Operations**
```powershell
# Run Prisma migrations
docker-compose exec app npx prisma migrate dev

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Seed database
docker-compose exec app npm run db:seed
```

### 4. **Stop Everything**
```powershell
# Stop containers (data persists)
docker-compose down

# Stop and remove data
docker-compose down -v
```

## 🔍 Troubleshooting

### Port Conflicts
```powershell
# Find what's using a port
netstat -ano | findstr :3000

# Change ports in docker-compose.yml
ports:
  - "3002:3000"  # Change 3001 to 3002
```

### Permission Issues
```powershell
# Run as Administrator if needed
# Or ensure Docker Desktop has file sharing enabled for your drive
```

### Slow Performance
```yaml
# In Docker Desktop settings:
# - Increase RAM to 8GB+
# - Enable VirtioFS for file sharing
# - Use WSL2 backend
```

---

This Docker setup ensures perfect compatibility across all your Windows machines! 🎉