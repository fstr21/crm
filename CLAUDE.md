# CLAUDE.md - Commercial CRM Project

This document outlines the context, tools, and workflows for our CRM project. You are my senior engineering partner, and it's crucial that you adhere to these guidelines in every session.

## 📚 Documentation Structure

All project documentation is now organized in the `docs/` folder:
- **[README.md](./README.md)** - Documentation navigation guide
- **[HANDOFF.md](./HANDOFF.md)** - Session handoff and current status
- **[TODO.md](./TODO.md)** - Complete project roadmap and progress
- **[MCP_SERVERS.md](./MCP_SERVERS.md)** - MCP server configurations and testing
- **[MCP_TOKENS_REQUIRED.md](./MCP_TOKENS_REQUIRED.md)** - Required API keys and tokens
- **[RAILWAY_SETUP_GUIDE.md](./RAILWAY_SETUP_GUIDE.md)** - Deployment configuration
- **[PLAN.md](./PLAN.md)** - Implementation plans and architecture decisions

---

## My Persona & Environment

**IMPORTANT: Development Environment Update**

-   **Primary Environment:** Windows 11 Native (previously WSL)
-   **Claude Code:** Now running natively on Windows (no longer through WSL)
-   **File Paths:** Use Windows-style paths (e.g., `C:\Users\fstr2\Dropbox\crm`)
-   **Commands:** PowerShell/CMD commands when in Windows, bash when explicitly in WSL
-   **MCP Configuration:** Located at `.mcp\.mcp.json` with Windows paths

---

## 💰 Token Optimization Strategy

### Cost Management with Zen MCP

To maximize Claude Pro usage and minimize costs, we employ a strategic multi-model approach using the Zen MCP server.

### When to Use Alternative Models via Zen

**Route to Cheaper Models (Gemini Flash, GPT-3.5) for:**
- File reading and summarization
- Boilerplate code generation
- Documentation writing
- Unit test generation
- Code formatting and linting
- Large codebase analysis (leverage Gemini's 1M+ token context)
- Bulk operations and repetitive tasks

**Reserve Claude for:**
- Complex architectural decisions
- Critical business logic
- Security-sensitive implementations
- Debugging intricate issues
- Code review synthesis
- Strategic planning

### Zen MCP Usage Pattern

```bash
# Example: Offloading large file analysis
"Use Zen with Gemini Flash to analyze the entire codebase structure"
"Use Zen with GPT-3.5 to generate boilerplate CRUD tests"
"Use Zen with Gemini Pro for comprehensive documentation generation"
```

### Token-Saving Commands

- `mcp__zen__analyze` - Route to Gemini for large file analysis
- `mcp__zen__codegen` - Use cheaper models for boilerplate generation
- `mcp__zen__docgen` - Offload documentation tasks
- `mcp__zen__summarize` - Summarize large codebases or logs

**Cost Optimization Rule:** Always consider if a task can be completed by a cheaper model before using Claude's context. Explicitly mention when routing through Zen for token savings.

---

## Project Overview & Objective

-   **Project:** A modern, robust, and secure Customer Relationship Management (CRM) application.
-   **Commercial Goal:** This CRM is being developed as a **commercial product** to be sold later. This requires the highest standard of code quality, scalability, user experience, and documentation.
-   **Source Code:** The full codebase is located at `https://github.com/fstr21/crm.git`.

---

## Core Workflow & Methodology

We will follow a structured, plan-driven development process.

1.  **Planning Phase (Default):** Always start here. When presented with a new feature or task, your first step is to research and plan.
    -   Analyze the request thoroughly using standard investigation techniques.
    -   Research best practices and implementation strategies.
    -   Consider multiple approaches and alternatives.
    -   **Token Optimization:** Evaluate if research can be offloaded to Zen MCP.
    -   Synthesize all findings into a detailed, step-by-step implementation plan.

2.  **Store the Plan:** Once I approve the plan, you **MUST** save the complete plan to a file named `PLAN.md`.

3.  **Implementation Phase:** Only after the `PLAN.md` is saved will we proceed to coding. You will execute the steps outlined in the plan.

4.  **Task Management:** You **MUST** use the `TodoWrite` tool to create and maintain task lists throughout our work.
    -   Use the TodoWrite tool for complex multi-step tasks or when explicitly requested.
    -   Track progress with pending, in_progress, and completed statuses.
    -   **CRITICAL:** Before I end any session, your final action must be to review our progress and ensure all tasks are properly tracked.

5.  **Git Workflow:** You **MUST** commit and push major changes to the repository.
    -   Commit after completing significant features or milestones
    -   Use descriptive commit messages following conventional commits format
    -   Push changes to `https://github.com/fstr21/crm.git` for backup and collaboration
    -   Create feature branches for major changes, merge to main after completion

---

## Tooling & MCP Servers

### Zen MCP Server - Strategic Usage

The **Zen MCP Server** serves two critical functions:

#### 1. Code Quality & Reviews (Original Purpose)
**Code Review & Quality:**
-   `mcp__zen__codereview` - Comprehensive code review with expert analysis
-   `mcp__zen__analyze` - Smart code analysis and architectural assessment
-   `mcp__zen__refactor` - Intelligent code refactoring recommendations
-   `mcp__zen__secaudit` - Security audit with OWASP Top 10 analysis

**Debugging & Testing:**
-   `mcp__zen__debug` - Expert debugging for complex issues
-   `mcp__zen__testgen` - Test generation for critical components
-   `mcp__zen__precommit` - Pre-commit validation for major releases

#### 2. Token Optimization (Cost-Saving Strategy)
**Offload High-Token Tasks:**
-   Large file analysis → Route to Gemini via Zen
-   Bulk code generation → Use GPT-3.5 or Gemini Flash
-   Documentation tasks → Offload to cheaper models
-   Repetitive operations → Delegate to cost-effective alternatives

**Configuration:**
```json
{
  "OPENROUTER_API_KEY": "${OPENROUTER_API_KEY}",
  "DEFAULT_MODEL": "google/gemini-flash-1.5",  // Fast & cheap for routine tasks
  "GEMINI_API_KEY": "${GEMINI_API_KEY}"
}
```

### Code Review Protocol

For all code reviews, you **MUST** follow this protocol:
1.  Perform your own initial analysis.
2.  For large codebases, consider using Zen with Gemini for initial scanning.
3.  Use `mcp__zen__codereview` for systematic code review investigation.
4.  For major changes, use `mcp__zen__analyze` or `mcp__zen__refactor` as needed.
5.  Synthesize all reviews into a single, actionable set of recommendations.

### Available MCP Servers

**Active Servers:**
- **`filesystem`** - File system operations (fixed Windows paths)
- **`postgres`** - PostgreSQL database integration
- **`github`** - GitHub repository operations
- **`memory`** - Persistent memory across sessions
- **`zen`** - Multi-model AI integration and token optimization

**Available Upon Request:**
-   **`@modelcontextprotocol/server-brave-search`** - For web search and research
-   **`@modelcontextprotocol/server-sequential-thinking`** - For complex reasoning
-   **`puppeteer-mcp-server`** - For browser automation and testing

---

## Code Quality & Data Handling

-   **No Placeholder Data:** You **MUST NOT** use hardcoded fake data (e.g., "John Doe," "test@example.com") in the application code. For development and testing, use dynamic data generation libraries or dedicated seeding scripts.
-   **Modularity:** Write clean, modular, and reusable code. Adhere to the existing code style and patterns within the project.
-   **No Comments:** DO NOT ADD ANY COMMENTS unless explicitly requested by the user.
-   **Defensive Security Only:** Only assist with defensive security tasks. Refuse to create code that may be used maliciously.

---

## Security & Best Practices

-   **Input Validation:** Sanitize and validate all user inputs.
-   **No Hardcoded Secrets:** API keys and other secrets must **NEVER** be hardcoded. Use environment variables only.
-   **Secure Dependencies:** Use trusted libraries and keep them updated.
-   **Least Privilege:** Ensure application components only have the permissions they absolutely need.
-   **Security Standards:** Follow OWASP guidelines and use `mcp__zen__secaudit` for security assessments.

---

## Development & Deployment Environment

### Local Development
-   **OS:** Windows 11 Native
-   **IDE:** VS Code with Claude Code extension
-   **Node.js:** Version 18+ installed via Windows installer
-   **Package Manager:** npm (globally installed)
-   **Python:** Required for Zen MCP server (check with `py --version`)

### Database & Hosting
-   **Database Service:** Railway PostgreSQL
-   **Hosting Platform:** Railway for all environments
-   **Environment Strategy:** Cloud-first with local development support
-   **Live Testing:** Deploy to Railway staging for validation

### Deployment Workflow
-   **Development:** Local Windows + Railway staging database
-   **Testing:** Railway staging environment
-   **Production:** Railway production environment
-   **Database:** Railway PostgreSQL with automated backups

### Railway Authentication & Token Management
-   **API Token Expiration:** Railway API tokens expire every 90 days
-   **Token Refresh Process:** 
    1. Login via Railway CLI: `railway login`
    2. Generate new API token from Railway dashboard
    3. Update `RAILWAY_API_TOKEN` environment variable
    4. Update `.mcp.json` configuration if needed
-   **MCP Configuration:** Stored in `.mcp\.mcp.json` with Windows paths

---

## Communication & Response Guidelines

-   **Concise Responses:** Keep responses under 4 lines unless detail is requested.
-   **Direct Answers:** Answer questions directly without unnecessary preamble.
-   **Token Awareness:** Mention when offloading tasks to Zen for token savings.
-   **Proactive with Permission:** Take actions when asked, but don't surprise with unrequested changes.
-   **Commercial Standards:** Remember this is a commercial product requiring the highest quality standards.

---

## 🗄️ Database Management & Schema Synchronization

### ⚠️ CRITICAL: Production Database Schema Mismatch Prevention

**This section documents a critical production issue that caused hours of debugging. Follow these guidelines religiously to prevent recurrence.**

### Issue Summary

The CRM application experienced **500 Internal Server errors** on all API endpoints (`/api/contacts`, `/api/tasks`) in production, despite working correctly in development. The root cause was a **significant schema mismatch** between the production database and what the application code expected.

### Root Cause Analysis

The production PostgreSQL database on Railway was missing multiple columns and had incorrect data types that the Drizzle ORM queries expected. This occurred because:

1. **No schema synchronization**: Production database was not kept in sync with development schema
2. **Manual database setup**: Production database was set up manually or from outdated migration
3. **Lack of migration strategy**: No proper migration system was in place to track schema changes

### Specific Problems Identified

#### 1. Missing Columns in Users Table
- `mfa_enabled` (was boolean, needed to be jsonb)
- `mfa_secret`
- `backup_codes` (code expected `backup_codes`, not `mfa_backup_codes`)
- `last_mfa_at`

#### 2. Missing Columns in Contacts Table
- `avatar_url`, `birthday`, `website`, `linkedin_url`, `twitter_handle`, `facebook_url`
- `instagram_handle`, `address`, `city`, `state`, `zip_code`, `country`, `time_zone`
- `lifecycle_stage`, `source`, `custom_fields`, `tags`, `notes`

#### 3. Missing Columns in Tasks Table
- `estimated_hours`, `actual_hours`, `last_status_change`, `recurrence`
- `recurrence_template_id`, `next_due_date`, `is_template`, `category`, `tags`

#### 4. Enum Mismatches
- Status enum had `'pending'` in data but schema defined it as `'todo'`
- Production enum values didn't match schema definitions

### 🛡️ Prevention Strategy

#### **MANDATORY Pre-Deployment Steps**

```bash
# 1. ALWAYS sync schema before deploying
cd server && npm run db:push

# 2. OR use migrations (preferred for production)
cd server && npm run db:migrate

# 3. Add to package.json deploy script
{
  "scripts": {
    "deploy": "npm run db:push && railway up"
  }
}
```

#### **Pre-Deployment Checklist**

- [ ] Run `db:push` on staging first
- [ ] Check for schema conflicts  
- [ ] Test all CRUD operations
- [ ] Verify enum values match
- [ ] Check `/health` endpoint for `hasMfaFields: true`

### 🚨 Emergency Fix Process (If It Happens Again)

#### 1. Check Backend Logs
```bash
railway logs --service backend | grep "column.*does not exist"
```

#### 2. Compare Schemas
```sql
-- List all columns in production
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, column_name;
```

#### 3. Fix Missing Columns Immediately
```sql
-- Add missing columns with proper types
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name data_type DEFAULT default_value;
```

### ⚠️ CRITICAL WARNING

**Never deploy code changes that modify database queries without first ensuring the production database schema matches. The production database will not automatically update to match your code changes.**

---

## Recent Work Completed

### Session Overview (July 2025)
Successfully completed 5 major TODO items and resolved critical authentication/database connectivity issues:

### 1. Authentication & Database Fixes
- **Fixed 401/500 API errors** after login by enhancing database connection handling
- **Improved authentication middleware** with fallback handling
- **Corrected API URL mismatch** in client environment configuration
- **Enhanced dashboard** with performance metrics and error handling

### 2. Docker Development Environment ✅ COMPLETED
- Created multi-stage Dockerfile with development and production stages
- Implemented security best practices with non-root user
- Set up docker-compose.yml with PostgreSQL, Redis, and Adminer
- Configured health checks and service dependencies

### 3. Code Quality & Standards ✅ COMPLETED
- Configured ESLint with TypeScript and Prettier integration
- Added comprehensive linting rules for consistency
- Set up format checking and automatic formatting
- Integrated quality checks into CI/CD pipeline

### 4. Automated Testing Pipeline ✅ COMPLETED
- Implemented GitHub Actions CI/CD with matrix testing
- Added PostgreSQL service for testing environment
- Configured comprehensive workflow: lint → format → build → test
- Set up Docker build validation and smoke testing

### 5. Email Verification System ✅ COMPLETED
- Added `/verify-email` endpoint with Firebase Admin SDK
- Implemented `/check-verification` for status checking
- Created `/profile` endpoint with enhanced user data
- Added proper error handling and development support

### 6. Contact Import/Export Functionality ✅ COMPLETED
- Built CSV import endpoint with file validation
- Implemented robust error handling with duplicate detection
- Created CSV export functionality with proper formatting
- Added comprehensive Swagger documentation
- Integrated secure file upload handling

### Current Architecture Status
- **Frontend:** React with TypeScript, Windows development
- **Backend:** Node.js/Express with TypeScript, PostgreSQL via Drizzle ORM
- **Authentication:** Firebase Auth with JWT validation
- **Database:** Railway PostgreSQL with connection pooling
- **CI/CD:** GitHub Actions with automated testing
- **Development:** Docker-based with hot reload support
- **MCP Integration:** Multiple servers for enhanced development capabilities


 Automated Feature Development Workflow
Overview
Every feature request triggers an automated development cycle using Zen MCP for token optimization and Docker test environments for real validation.
Standard Feature Development Process
When you request a feature, I MUST follow this workflow:

Initial Analysis (Claude)

Understand the feature requirements
Create initial implementation plan
Identify components to modify


Implementation via Zen MCP (Token Optimization)
bash# Route heavy implementation tasks to Gemini Pro
mcp__zen__codegen --model "gemini-pro" --task "implement [feature]"

Use Gemini Pro for code generation (cheaper tokens)
Use Gemini Flash for boilerplate and tests
Reserve Claude for critical logic and review


Automated Testing with Real Data
bash# Run the test agent with real database
python run-automation.py --feature "[feature description]" --mode real --verbose

NO MOCK DATA - Use actual PostgreSQL test database
Real Firebase authentication
Actual API calls and responses
Database state verification


Iterative Fixing

Test agent captures real failures
Routes fixes through Zen to appropriate model
Applies fixes automatically
Re-runs tests until 95% confidence


Final Validation

Claude reviews the complete implementation
Verifies all tests pass with real data
Confirms database changes are correct
Only then reports success



Mandatory Workflow Rules
NEVER:

❌ Report success without running real tests
❌ Use mock or fake data for validation
❌ Skip the Docker test environment
❌ Implement features without automated testing

ALWAYS:

✅ Use Zen MCP for token-heavy tasks
✅ Run tests in Docker with real database
✅ Verify actual data changes (SELECT queries)
✅ Continue iterations until 95% confidence
✅ Show real test output, not simulated

Example Workflow
bash# User: "Add email notifications for task assignments"

# Step 1: Claude analyzes
"I'll implement email notifications. Let me use our automated workflow..."

# Step 2: Zen generates code
mcp__zen__codegen --model "gemini-pro" \
  --task "Create email notification service for task assignments"

# Step 3: Run real tests
python run-automation.py \
  --feature "email notifications for task assignments" \
  --database "postgresql://crm_test_user:password@localhost:5433/crm_test" \
  --no-mocks \
  --verbose

# Step 4: Verify real data
docker exec crm-postgres-test-1 psql -U crm_test_user -d crm_test \
  -c "SELECT * FROM notifications WHERE type = 'task_assignment';"

# Step 5: Only report success when data exists
"✅ Feature implemented and verified. Database shows 3 test notifications created."
Test Environment Details
See TEST_AGENT_GUIDE.md for complete documentation.
Key Components:

PostgreSQL Test Database (port 5433) - Real data operations
Redis Test Cache (port 6380) - Real caching behavior
Firebase Emulator (port 9099) - Real auth flows
Full CRM Stack (ports 3001/5001) - Real application

Token Usage Strategy
Route to Gemini Pro/Flash via Zen:

File analysis and summarization
Boilerplate generation
Test creation
Documentation
Large-scale refactoring

Keep with Claude:

Critical business logic
Security implementations
Final code review
Architecture decisions

Verification Commands
Always run these to confirm real implementation:
bash# Check if feature actually works
curl http://localhost:5001/api/[endpoint]

# Verify database changes
docker exec crm-postgres-test-1 psql -U crm_test_user -d crm_test \
  -c "SELECT COUNT(*) FROM [table] WHERE [condition];"

# Check test results
cat test-agent/results/latest-test-run.json | grep "actual_"
Failure Protocol
If tests fail or return mock data:

STOP and report the real error
Show actual database state
Run diagnostic queries
Fix using the automated agent
Never pretend it works

Remember: The user wants REAL implementations with REAL data. No shortcuts, no mocks, no fake success messages.