# 🎼 MCP Orchestra Container

Automated workflow orchestration with 75-85% token cost reduction through intelligent model routing.

## Quick Start

1. **Configure API Keys**
   ```bash
   cp .docker/mcp-orchestra/.env.example .docker/mcp-orchestra/.env
   # Add your API keys to the .env file
   ```

2. **Start Orchestra**
   ```bash
   docker-compose up mcp-orchestra
   ```

3. **Test Automation**
   ```bash
   curl -X POST http://localhost:3010/api/workflow \
     -H "Content-Type: application/json" \
     -d '{"workflowType": "research_plan_build", "params": {"feature": "user authentication"}}'
   ```

## Model Routing Strategy

| Task Type | Primary Model | Cost Savings | Fallback |
|-----------|---------------|--------------|----------|
| Research & Analysis | Gemini Pro | 75% | Claude |
| Code Generation | Gemini Flash | 85% | Claude |
| Testing & Debugging | GPT-3.5 | 70% | Claude |
| Critical Decisions | Claude | 0% | Claude |

## Automated Workflows

### Research → Plan → Build
```javascript
{
  "workflowType": "research_plan_build",
  "params": {
    "feature": "shopping cart with payment integration"
  }
}
```

### Test → Fix → Deploy
```javascript
{
  "workflowType": "test_fix_deploy", 
  "params": {
    "code": "// your generated code here"
  }
}
```

## Confidence Thresholds

- **Auto-proceed**: 95% confidence
- **Human review**: 85% confidence  
- **Retry with Claude**: 70% confidence

## Endpoints

- `GET /health` - Orchestra status
- `POST /api/route` - Single model routing
- `POST /api/workflow` - Execute workflow
- `GET /api/workflows` - View active workflows

Built to eliminate Claude crashes through intelligent automation! 🚀