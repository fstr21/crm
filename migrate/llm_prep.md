# 📄 NovaCRM Prompt Guide — For LLMs Helping Claude

This document is for **LLMs like GPT-4 or Gemini**.  
Your task is to write clear, safe, and cost-efficient prompts that Claude can follow while developing this CRM **without Docker**.

---

## ❌ Docker Usage Removed

As of July 2025, NovaCRM is **no longer using Docker** for any part of the project.

All services are installed and run **locally**:
- Claude runs in VS Code (Claude Code)
- MCPs are installed and started manually
- Supabase handles fullstack backend, frontend, and database
- Local environment: **Windows 11 Native**

> Do not reference Docker, containers, WSL, or port mappings.  
> Do not suggest `docker-compose`, `docker exec`, or container healthchecks.

---

## 🧠 Project Architecture

| Component      | Technology        |
|----------------|-------------------|
| Frontend       | Next.js (local, deployed via Vercel) |
| Backend API    | Supabase Edge Functions |
| Database       | Supabase PostgreSQL |
| Auth           | Supabase Auth (JWT, OAuth) |
| Storage        | Supabase Storage |
| Realtime       | Supabase Realtime |
| AI Integration | Claude + local Zen MCP (Gemini, GPT-3.5) |

---

## 🎯 Prompt Format Expectations

When you receive a user request (e.g., *“Add lead scoring”*), you must output a prompt for Claude that:

1. Uses **Zen MCP** with **Gemini Pro** for research
2. Requires a `PLAN.md` before any code is written
3. Instructs Claude to:
   - Only use real Supabase queries, no mock data
   - Run real code/tests with local data
   - Return verified results or errors
4. Stops on failure (Zen, test, or DB-related)

---

## ✅ Prompt Example

> **Claude, here's what to do:**  
> 1. Use Zen MCP with Gemini Pro to design a lead scoring engine that integrates with Supabase (DB + Auth).  
> 2. Create a `PLAN.md` with schema updates, rules logic, and test plan.  
> 3. Use Zen with Gemini Flash or GPT-3.5 to generate the code and unit tests.  
> 4. Run the code locally using `npm run test`.  
> 5. Confirm with real data: ensure test users receive scores and DB entries are updated.  
> 6. If any tool fails (Zen, test), stop and alert me.

---

## 🧠 Claude Prompt Requirements

All Claude prompts **must**:

- Start with:  
  > "Let me research this using Zen with Gemini Pro..."

- Include the following structure:

| Phase | Instruction |
|-------|-------------|
| Research | Use Zen with Gemini Pro |
| Plan | Write a `PLAN.md` |
| Build | Use Zen Flash or GPT-3.5 via MCP |
| Test | Run with Supabase DB, confirm outcomes |
| Report | Return code, plan, and proof |

---

## 🔍 Testing Standards

Claude must:

- Use real Supabase DB queries (e.g., `select * from leads`)
- Confirm changes using actual `supabase-js` or Prisma calls
- Avoid mocks, fake schemas, or dummy records
- Output a `TestResults` section with pass/fail counts

---

## ⚠️ Claude Must Stop If:

- Zen fails or returns an error
- Any MCP tool is unavailable (check with `/mcp`)
- Supabase DB is not connected or returns unexpected results
- Confidence is below 95%

---

## ⚙️ Claude Development Environment

| Tool        | Method |
|-------------|--------|
| Supabase    | Used directly via SDK and Edge functions |
| MCPs        | Installed and started manually |
| Claude IDE  | VS Code with Claude Code |
| Database    | Supabase cloud instance |
| Auth        | Supabase JWT/OAuth |

All tools must be reachable via `.mcp.json`. No containers or external orchestration are used.

---

## ✅ Output Checklist

Claude must return:

- [ ] `PLAN.md` with schema, logic, endpoints, and test plan
- [ ] Code files via filesystem MCP
- [ ] Test output results
- [ ] Confirmation from Supabase DB (e.g., data exists)
- [ ] Any failures or tool errors

---

## 📌 Summary

You're writing prompts for Claude Code in a **non-Docker**, **Supabase-powered**, **Windows-native** project.

Every prompt must help Claude:
- Use Zen with Gemini Pro
- Work with real Supabase data
- Avoid mockups or assumptions
- Always test and confirm

Do not suggest Docker, containers, or port configurations. The entire project now runs **locally** and is managed by hand for simplicity and control.

