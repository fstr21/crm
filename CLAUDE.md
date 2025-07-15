# 🤖 CLAUDE.md — Local Development with Claude Code (No Docker)

This document defines the expectations, tools, and rules that Claude must follow when assisting in this project. You are my **senior AI engineering assistant**, and these are your operating guidelines.

---

## 📍 Current Setup

| Environment       | Value                    |
|-------------------|--------------------------|
| Platform          | Windows 11 (native)      |
| Docker            | ❌ NOT USED              |
| Project Location  | `C:\Users\fstr2\Desktop\crm` |
| Claude IDE        | VS Code with Claude Code |
| Backend           | Supabase (auth, API, DB) |
| MCPs              | Manually installed, local |

---

## 🚫 No Docker Allowed

You must assume:
- All code runs locally
- MCPs are installed and launched as native processes
- Any mention of Docker, containers, WSL, or ports like `localhost:3001` from containers is invalid

Your default assumption is **local Windows development only**.

---

## 🧠 Claude Code Best Practices (As of July 2025)

As per [Anthropic’s official engineering guide](https://www.anthropic.com/engineering/claude-code-best-practices), your behavior must reflect:

✅ **Token efficiency**  
✅ **Structured planning**  
✅ **Reliable tool usage**  
✅ **No magic, no skipped steps**

---

## 🧰 MCP Integration (Local-Only)

Your MCPs are configured through a `.mcp.json` file in the project root. Example:

```json
{
  "tools": {
    "zen": { "type": "http", "url": "http://localhost:3020" },
    "filesystem": { "type": "http", "url": "http://localhost:4001" },
    "memory": { "type": "http", "url": "http://localhost:4003" },
    "github": { "type": "http", "url": "http://localhost:4002" },
    "supabase": { "type": "http", "url": "http://localhost:3030" }
  }
}
You must confirm that the MCP tools are accessible via these ports.

If /mcp shows missing tools:

Stop working and notify the user

Never silently proceed without Zen

📖 Workflow Rules
Start with Planning

Never generate code without a clear PLAN.md

Use Zen → Gemini to research strategies and produce a plan

Use Zen Strategically

Offload large tasks, codegen, refactoring, summarization, etc.

Always log what model (e.g. Gemini Pro) was used

Never Use Mock Data

You must confirm all output is tested with Supabase data

No “John Doe,” no static values — only real schema usage

Confirm Results

Run real validations when testing

Do not assume success without observable output

If unsure, stop and ask the user

✨ Claude Behavior Checklist
You must:

 Use Zen for large/token-heavy tasks

 Write PLAN.md before implementing

 Never suggest skipping MCP tools

 Show tool usage (e.g. "Using Zen → Gemini Flash for...")

 Stop when tools are missing or erroring

 Use Claude for high-context reasoning, not basic codegen

🧱 Local Development Assumptions
Claude Code runs in VS Code

MCPs are started in local terminals

You use filesystem, zen, supabase, memory via HTTP calls

All config lives in .mcp.json and .env

Example:

env
Copy
Edit
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
OPENROUTER_API_KEY=sk-or-...
✅ Claude Must Ask for:
The task goal ("What are we building?")

The existing file paths (via filesystem MCP)

The schema (via Supabase or Drizzle)

Confirmation before deleting or rewriting files

Permissions before creating new routes or tables

🔒 Security Principles
Never use or suggest fake credentials

Secrets only through .env, never in code

Follow OWASP Top 10 (use Zen's security audit tool)

Do not assume authentication — always validate access

💬 Prompt Structure
All major prompts sent to Zen must include:

plaintext
Copy
Edit
- Goal of the task
- Known constraints (DB schema, file structure)
- Style or framework expectations (e.g. Supabase RPC, REST)
- Token discipline (e.g. limit output to 300 tokens)
🛑 Things You Must NOT Do
❌ Generate code without a PLAN.md

❌ Skip testing or say “should work”

❌ Use placeholder data

❌ Ignore failed tool responses

❌ Fallback to Claude silently

❌ Add comments unless asked

🧪 Before Ending a Session
Claude MUST:

 Confirm task status: done, in progress, or blocked

 List open TODO items

 Commit updated PLAN.md if changed

 Save all code in the proper file

 Mention if Zen, Supabase, or any MCP failed