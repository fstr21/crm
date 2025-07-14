# 🤖 MCP Orchestration - All Servers Dockerized

## 🎯 Goal: One MCP Setup, Every Machine

No more:
- Machine-specific paths in `.mcp.json`
- "Can't find Python" errors
- Different MCP versions on different machines
- Git conflicts with MCP configurations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           VS Code + Claude                   │
│                    │                         │
│                    ▼                         │
│         MCP Orchestra Container              │
│  ┌─────────────────────────────────────┐   │
│  │  📁 Filesystem MCP                   │   │
│  │  🗄️  PostgreSQL MCP                  │   │
│  │  🐙 GitHub MCP                      │   │
│  │  🧠 Memory MCP                      │   │
│  │  📚 Context7 MCP                    │   │
│  │  🤖 Zen MCP (OpenRouter)            │   │
│  │  🚂 Railway MCP                     │   │
│  │  💳 Stripe MCP                      │   │
│  │  📧 Gmail MCP                       │   │
│  └─────────────────────────────────────┘   │
│                    │                         │
│                    ▼                         │
│           Your CRM Application               │
└─────────────────────────────────────────────┘
```

## 📁 MCP Orchestra Structure

```
.docker/mcp-orchestra/
├── Dockerfile                 # Multi-stage build for all MCPs
├── docker-compose.mcp.yml     # MCP-specific compose
├── servers/
│   ├── filesystem/
│   │   └── config.json
│   ├── postgres/
│   │   └── config.json
│   ├── zen/
│   │   ├── server.py
│   │   ├── requirements.txt
│   │   └── config.json
│   ├── context7/
│   │   └── config.json
│   └── shared/
│       └── base-config.json
├── scripts/
│   ├── start-mcp.sh          # Orchestration script
│   ├── health-check.sh       # Monitor MCP health
│   └── register-mcp.sh       # Register with Claude
└── web-ui/                   # Management dashboard
    ├── index.html
    └── api.js
```

## 🐋 MCP Orchestra Dockerfile

### `.docker/mcp-orchestra/Dockerfile`
```dockerfile
# syntax=docker/dockerfile:1

# Base stage with common dependencies
FROM node:20-python3 AS base
WORKDIR /mcp
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    @modelcontextprotocol/server-filesystem \
    @modelcontextprotocol/server-postgres \
    @modelcontextprotocol/server-github \
    @modelcontextprotocol/server-memory \
    @upstash/context7-mcp@latest \
    @jasontanswe/railway-mcp \
    @benborla29/mcp-server-mysql \
    gmail-mcp-server \
    stripe-mcp-server

# Python dependencies for Zen
FROM base AS python-deps
COPY servers/zen/requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Final stage
FROM python-deps AS final

# Copy all server configurations
COPY servers/ /mcp/servers/
COPY scripts/ /mcp/scripts/
COPY web-ui/ /mcp/web-ui/

# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Make scripts executable
RUN chmod +x /mcp/scripts/*.sh

# Web UI port
EXPOSE 8080

# Health check endpoint
EXPOSE 8081

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

## 🎛️ Supervisor Configuration

### `.docker/mcp-orchestra/supervisord.conf`
```ini
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:mcp-orchestrator]
command=node /mcp/scripts/orchestrator.js
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/orchestrator.log
stderr_logfile=/var/log/mcp/orchestrator.err

[program:filesystem-mcp]
command=npx @modelcontextprotocol/server-filesystem /workspace
environment=WORKSPACE_PATH="/workspace"
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/filesystem.log

[program:postgres-mcp]
command=npx @modelcontextprotocol/server-postgres
environment=DATABASE_URL="%(ENV_DATABASE_URL)s"
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/postgres.log

[program:github-mcp]
command=npx @modelcontextprotocol/server-github
environment=GITHUB_TOKEN="%(ENV_GITHUB_TOKEN)s"
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/github.log

[program:memory-mcp]
command=npx @modelcontextprotocol/server-memory
environment=MEMORY_PATH="/data/memory"
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/memory.log

[program:context7-mcp]
command=npx @upstash/context7-mcp@latest
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/context7.log

[program:zen-mcp]
command=python /mcp/servers/zen/server.py
environment=OPENROUTER_API_KEY="%(ENV_OPENROUTER_API_KEY)s",DEFAULT_MODEL="auto"
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/zen.log

[program:web-ui]
command=python -m http.server 8080 --directory /mcp/web-ui
autostart=true
autorestart=true
stdout_logfile=/var/log/mcp/web-ui.log
```

## 🔧 MCP Orchestrator Script

### `.docker/mcp-orchestra/scripts/orchestrator.js`
```javascript
const express = require('express');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const PORT = 8081;

// MCP Server Registry
const mcp_servers = {
  filesystem: {
    name: 'Filesystem MCP',
    status: 'stopped',
    process: null,
    logs: []
  },
  postgres: {
    name: 'PostgreSQL MCP',
    status: 'stopped',
    process: null,
    logs: []
  },
  github: {
    name: 'GitHub MCP',
    status: 'stopped',
    process: null,
    logs: []
  },
  memory: {
    name: 'Memory MCP',
    status: 'stopped',
    process: null,
    logs: []
  },
  context7: {
    name: 'Context7 MCP',
    status: 'stopped',
    process: null,
    logs: []
  },
  zen: {
    name: 'Zen MCP',
    status: 'stopped',
    process: null,
    logs: []
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  const status = Object.entries(mcp_servers).map(([id, server]) => ({
    id,
    name: server.name,
    status: server.status,
    uptime: server.process ? process.uptime() : 0
  }));
  res.json({ status, timestamp: new Date() });
});

// Start specific MCP server
app.post('/mcp/:id/start', (req, res) => {
  const { id } = req.params;
  if (!mcp_servers[id]) {
    return res.status(404).json({ error: 'MCP server not found' });
  }
  
  // Start logic here
  mcp_servers[id].status = 'running';
  res.json({ message: `Started ${id}` });
});

// WebSocket for real-time logs
const wss = new WebSocket.Server({ port: 8082 });
wss.on('connection', (ws) => {
  console.log('Client connected for logs');
  
  ws.on('message', (message) => {
    const { server } = JSON.parse(message);
    if (mcp_servers[server]) {
      ws.send(JSON.stringify({
        server,
        logs: mcp_servers[server].logs
      }));
    }
  });
});

app.listen(PORT, () => {
  console.log(`MCP Orchestrator running on port ${PORT}`);
});
```

## 🌐 Web Management UI

### `.docker/mcp-orchestra/web-ui/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MCP Orchestra Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto p-8">
        <h1 class="text-4xl font-bold mb-8">MCP Orchestra Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- MCP Server Cards -->
            <div id="mcp-servers"></div>
        </div>
        
        <div class="mt-8">
            <h2 class="text-2xl font-semibold mb-4">Configuration</h2>
            <div class="bg-gray-800 p-6 rounded-lg">
                <pre id="config-display" class="text-sm"></pre>
            </div>
        </div>
        
        <div class="mt-8">
            <h2 class="text-2xl font-semibold mb-4">Logs</h2>
            <div class="bg-gray-800 p-6 rounded-lg h-96 overflow-y-auto">
                <pre id="log-display" class="text-sm"></pre>
            </div>
        </div>
    </div>
    
    <script>
        // Connect to orchestrator
        async function fetchHealth() {
            const response = await fetch('http://localhost:8081/health');
            const data = await response.json();
            updateServerCards(data.status);
        }
        
        function updateServerCards(servers) {
            const container = document.getElementById('mcp-servers');
            container.innerHTML = servers.map(server => `
                <div class="bg-gray-800 p-6 rounded-lg">
                    <h3 class="text-xl font-semibold">${server.name}</h3>
                    <div class="mt-2">
                        <span class="inline-block px-3 py-1 rounded-full text-sm ${
                            server.status === 'running' 
                                ? 'bg-green-600' 
                                : 'bg-red-600'
                        }">
                            ${server.status}
                        </span>
                    </div>
                    <div class="mt-4">
                        <button onclick="toggleServer('${server.id}')" 
                                class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                            ${server.status === 'running' ? 'Stop' : 'Start'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // WebSocket for logs
        const ws = new WebSocket('ws://localhost:8082');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            document.getElementById('log-display').textContent = 
                data.logs.join('\n');
        };
        
        // Refresh every 5 seconds
        setInterval(fetchHealth, 5000);
        fetchHealth();
    </script>
</body>
</html>
```

## 🔗 Claude Integration

### `.docker/mcp-orchestra/claude-config.json`
```json
{
  "mcpServers": {
    "crm-mcp": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "crm-mcp-orchestra",
        "node",
        "/mcp/scripts/mcp-proxy.js"
      ],
      "env": {
        "MCP_MODE": "orchestrated"
      }
    }
  }
}
```

### MCP Proxy Script
```javascript
// .docker/mcp-orchestra/scripts/mcp-proxy.js
const net = require('net');
const { spawn } = require('child_process');

// This proxy handles all MCP requests and routes to appropriate servers
const proxy = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = JSON.parse(data.toString());
    
    // Route based on tool prefix
    if (request.tool.startsWith('filesystem_')) {
      forwardToServer('filesystem', request, socket);
    } else if (request.tool.startsWith('postgres_')) {
      forwardToServer('postgres', request, socket);
    } else if (request.tool.startsWith('zen_')) {
      forwardToServer('zen', request, socket);
    }
    // ... etc
  });
});

proxy.listen(9999);
```

## 🚀 Docker Compose for MCP

### `docker-compose.mcp.yml`
```yaml
version: '3.8'

services:
  mcp-orchestra:
    build:
      context: .docker/mcp-orchestra
      dockerfile: Dockerfile
    container_name: crm-mcp-orchestra
    ports:
      - "8080:8080"   # Web UI
      - "8081:8081"   # Health API
      - "8082:8082"   # WebSocket logs
      - "9999:9999"   # MCP proxy
    environment:
      # API Keys from .env
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      STRIPE_API_KEY: ${STRIPE_API_KEY}
      GMAIL_CLIENT_ID: ${GMAIL_CLIENT_ID}
      GMAIL_CLIENT_SECRET: ${GMAIL_CLIENT_SECRET}
      
      # Database connection
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-crm}
      
      # Workspace
      WORKSPACE_PATH: /workspace
    volumes:
      # Mount your project as workspace
      - .:/workspace:ro
      
      # Persistent data
      - .docker/volumes/mcp-data:/data
      
      # Logs
      - .docker/volumes/mcp-logs:/var/log/mcp
    depends_on:
      - postgres
    networks:
      - crm-network
```

## 📝 Environment Configuration

### `.env` additions
```bash
# MCP Orchestra
OPENROUTER_API_KEY=sk-or-v1-your-key
GITHUB_TOKEN=ghp_your-token
STRIPE_API_KEY=sk_test_your-key
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret

# MCP Settings
MCP_LOG_LEVEL=info
MCP_TIMEOUT=30000
MCP_MAX_RETRIES=3
```

## 🎮 Usage

### 1. **Start MCP Orchestra**
```powershell
# Include MCP services
docker-compose -f docker-compose.yml -f docker-compose.mcp.yml up -d
```

### 2. **Access MCP Dashboard**
- Open: http://localhost:8080
- View server status
- Check logs
- Configure settings

### 3. **Configure Claude Desktop**
```powershell
# Windows path
notepad "$env:APPDATA\Claude\claude_desktop_config.json"

# Add the orchestrated MCP configuration
# (Copy from claude-config.json above)
```

### 4. **Use in Claude**
```
# All MCP tools now available with consistent naming:
- filesystem_read
- postgres_query
- zen_codereview
- context7_search
- github_create_issue
- etc.
```

## 🔍 Troubleshooting

### Check MCP Health
```powershell
# View all MCP status
curl http://localhost:8081/health

# Check specific MCP logs
docker logs crm-mcp-orchestra --tail 50

# Enter container for debugging
docker exec -it crm-mcp-orchestra bash
```

### Common Issues

#### 1. **MCP Not Responding**
```bash
# Restart specific service
docker exec crm-mcp-orchestra supervisorctl restart zen-mcp
```

#### 2. **Permission Errors**
```yaml
# Ensure volumes have correct permissions
volumes:
  - .:/workspace:ro  # Read-only for safety
```

#### 3. **API Key Issues**
```powershell
# Verify environment variables
docker exec crm-mcp-orchestra env | grep API_KEY
```

## 🎯 Benefits

1. **Consistency**: Same MCP setup on every machine
2. **Isolation**: MCPs can't mess with your system
3. **Versioning**: Lock MCP versions in Dockerfile
4. **Monitoring**: Web UI to see what's happening
5. **Easy Updates**: Just rebuild the container

---

No more MCP compatibility nightmares! Everything runs in Docker! 🐳✨