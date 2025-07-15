# 🧠 MCP Setup for Local Development (No Docker)

## ✅ Philosophy

You’ve decided to install each MCP **directly on your machine** (desktop and laptop). This means:

- No Docker
- No Linux containers
- Everything runs natively on Windows with Python or Node
- Supabase handles front, back, auth, and DB
- Claude connects to MCPs via `.mcp.json`

---

## 📁 Directory Structure

```bash
<your-project-root>/
├── .mcp.json             # MCP config Claude reads
├── mcp/
│   ├── zen/              # Zen MCP (Gemini Pro access)
│   ├── github/           # GitHub MCP (optional)
│   ├── memory/           # Memory MCP
│   ├── filesystem/       # Filesystem MCP
│   ├── context7/         # Contextual search MCP
│   └── supabase/         # Supabase utility MCP
⚙️ Setup Each MCP
🔹 Zen MCP
Handles calls to external LLMs like Gemini

bash
Copy
Edit
cd mcp/zen
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# To run:
python server.py
It should run on http://localhost:3020

🔹 Filesystem MCP
Lets Claude access your file structure

bash
Copy
Edit
npm install -g @modelcontextprotocol/server-filesystem

# To run:
filesystem-mcp --workspace <path-to-your-crm-folder>
🔹 GitHub MCP (optional)
bash
Copy
Edit
npm install -g @modelcontextprotocol/server-github

# Requires:
export GITHUB_TOKEN=ghp_your_token
github-mcp
🔹 Memory MCP (optional)
bash
Copy
Edit
npm install -g @modelcontextprotocol/server-memory
memory-mcp
🔹 Context7 MCP (optional)
bash
Copy
Edit
npm install -g @upstash/context7-mcp
context7-mcp
🔹 Supabase MCP (optional)
If you want extra logic/monitoring on Supabase:

bash
Copy
Edit
cd mcp/supabase
npm install
npm run http
🧩 .mcp.json Config (local version)
Put this in the root of your CRM project:

json
Copy
Edit
{
  "tools": {
    "zen": {
      "type": "http",
      "url": "http://localhost:3020"
    },
    "filesystem": {
      "type": "http",
      "url": "http://localhost:4001"
    },
    "github": {
      "type": "http",
      "url": "http://localhost:4002"
    },
    "memory": {
      "type": "http",
      "url": "http://localhost:4003"
    },
    "context7": {
      "type": "http",
      "url": "http://localhost:4004"
    },
    "supabase": {
      "type": "http",
      "url": "http://localhost:3030"
    }
  }
}
Make sure each MCP uses the correct port. You can change them freely — just update here.

🧪 MCP Debug Checklist
✅ .mcp.json is in root of workspace

✅ You’ve run each MCP manually in a separate terminal

✅ Ports are not blocked (no firewall rule issues)

✅ Claude shows MCPs when you run /mcp

💡 Tips
Use Task Scheduler or a shell script to auto-start all MCPs on login

Keep .mcp.json in Git with relative URLs if using localhost

You can install PM2 (Node) or nssm (Windows) to run these MCPs in the background

🎯 Final Outcome
With this setup:

Claude uses your MCPs directly via local ports

You control everything without Docker

Your CRM code and MCPs can live together — easy for Claude to interact with them