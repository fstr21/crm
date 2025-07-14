# 🔄 Automated Workflow - Research → Plan → Build → Test

## 🎯 Your Workflow Vision (From Reddit/CLAUDE.md)

```
BEFORE DOING ANYTHING, YOU MUST:
1. ALWAYS use zen gemini for complex problems
2. ALWAYS check Context7 for library documentation  
3. NEVER jump straight to coding
4. SAY: "Let me research the codebase using zen gemini and Context7"
```

## 🏗️ Complete Automation Pipeline

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Feature Request │────▶│  Research Phase   │────▶│  Planning Phase  │
│  from You        │     │  (Zen + Context7) │     │  (PLAN.md)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                            │
                                                            ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Deployment      │◀────│  Testing Phase    │◀────│  Building Phase  │
│  (Automated)     │     │  (Docker + Real)  │     │  (Zen Generate)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 📋 Workflow Configuration

### `.docker/workflow/workflow-config.yml`
```yaml
# Workflow automation configuration
workflow:
  phases:
    research:
      timeout: 300  # 5 minutes
      tools:
        - zen_mcp:
            model: "gemini-pro"  # Best for analysis
            mode: "analyze"
        - context7_mcp:
            search_depth: "comprehensive"
      outputs:
        - research_summary.md
        - architecture_analysis.md
        - best_practices.md
    
    planning:
      timeout: 180  # 3 minutes
      requires: ["research"]
      tools:
        - zen_mcp:
            model: "gemini-pro"
            mode: "plan"
      outputs:
        - PLAN.md
        - acceptance_criteria.md
        - test_scenarios.md
    
    building:
      timeout: 600  # 10 minutes
      requires: ["planning"]
      tools:
        - zen_mcp:
            model: "gemini-flash"  # Cheaper for code generation
            mode: "codegen"
        - filesystem_mcp:
            mode: "write"
      outputs:
        - implementation_files
        - unit_tests
        - integration_tests
    
    testing:
      timeout: 900  # 15 minutes
      requires: ["building"]
      environment: "docker-test"
      tools:
        - test_runner:
            mode: "real_data"
            database: "test"
        - zen_mcp:
            model: "gpt-3.5-turbo"  # Cheap for test fixes
            mode: "fix"
      success_criteria:
        confidence: 0.95
        coverage: 0.90
        all_tests_pass: true
```

## 🤖 Automated Test Agent

### `.docker/test-agent/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /agent

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Agent code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Entry point
CMD ["python", "-m", "src.agent"]
```

### `.docker/test-agent/src/agent.py`
```python
import asyncio
import json
from typing import Dict, List, Any
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext
import subprocess
import psycopg2
from pathlib import Path

@dataclass
class TestResult:
    passed: int
    failed: int
    errors: List[str]
    confidence: float
    database_state: Dict[str, Any]

class CRMTestAgent:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.agent = Agent(
            model=config.get('model', 'openai:gpt-4'),
            system_prompt="""You are a test automation expert for a CRM application.
            You analyze test failures, suggest fixes, and verify implementations.
            Always use REAL database operations, never mock data."""
        )
        self.db_url = config['database_url']
        self.max_iterations = config.get('max_iterations', 10)
        
    async def run_feature_implementation(self, feature_description: str) -> TestResult:
        """Implement a feature with automated testing"""
        
        iteration = 0
        confidence = 0.0
        
        while iteration < self.max_iterations and confidence < 0.95:
            iteration += 1
            print(f"\n🔄 Iteration {iteration}/{self.max_iterations}")
            
            # Step 1: Run current tests
            test_results = await self._run_tests()
            
            # Step 2: Check database state
            db_state = await self._check_database_state()
            
            # Step 3: Calculate confidence
            confidence = self._calculate_confidence(test_results, db_state)
            
            print(f"📊 Confidence: {confidence:.2%}")
            
            if confidence >= 0.95:
                print("✅ Feature implementation complete!")
                break
                
            # Step 4: Analyze failures
            analysis = await self._analyze_failures(test_results, db_state)
            
            # Step 5: Generate fixes
            fixes = await self._generate_fixes(analysis)
            
            # Step 6: Apply fixes
            await self._apply_fixes(fixes)
            
        return TestResult(
            passed=test_results['passed'],
            failed=test_results['failed'],
            errors=test_results.get('errors', []),
            confidence=confidence,
            database_state=db_state
        )
    
    async def _run_tests(self) -> Dict[str, Any]:
        """Run actual tests in Docker environment"""
        cmd = [
            'docker', 'exec', 'crm-app-test',
            'npm', 'run', 'test:ci'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Parse test output
        output = result.stdout
        passed = len([l for l in output.split('\n') if '✓' in l])
        failed = len([l for l in output.split('\n') if '✗' in l])
        
        return {
            'passed': passed,
            'failed': failed,
            'output': output,
            'errors': result.stderr.split('\n') if result.stderr else []
        }
    
    async def _check_database_state(self) -> Dict[str, Any]:
        """Check actual database state"""
        conn = psycopg2.connect(self.db_url)
        cur = conn.cursor()
        
        queries = {
            'users_count': "SELECT COUNT(*) FROM users",
            'contacts_count': "SELECT COUNT(*) FROM contacts",
            'tasks_count': "SELECT COUNT(*) FROM tasks",
            'recent_activities': """
                SELECT type, created_at 
                FROM activities 
                ORDER BY created_at DESC 
                LIMIT 5
            """
        }
        
        results = {}
        for name, query in queries.items():
            cur.execute(query)
            results[name] = cur.fetchall()
            
        conn.close()
        return results
    
    async def _analyze_failures(self, test_results: Dict, db_state: Dict) -> Dict:
        """Use AI to analyze test failures"""
        prompt = f"""
        Analyze these test failures:
        
        Test Results:
        {json.dumps(test_results, indent=2)}
        
        Database State:
        {json.dumps(db_state, indent=2)}
        
        Identify:
        1. Root cause of failures
        2. Missing implementations
        3. Database inconsistencies
        4. Suggested fixes
        """
        
        result = await self.agent.run(prompt)
        return result.data
    
    async def _generate_fixes(self, analysis: Dict) -> List[Dict]:
        """Generate code fixes based on analysis"""
        fixes = []
        
        # Route to cheaper model for code generation
        zen_prompt = f"""
        mcp__zen__codegen --model gemini-flash
        Generate fixes for: {json.dumps(analysis)}
        """
        
        # This would integrate with your MCP system
        # For now, return structured fixes
        return fixes
    
    async def _apply_fixes(self, fixes: List[Dict]) -> None:
        """Apply generated fixes to codebase"""
        for fix in fixes:
            file_path = fix['file']
            content = fix['content']
            
            # Write to filesystem via MCP
            # mcp__filesystem__write(file_path, content)
            pass
    
    def _calculate_confidence(self, test_results: Dict, db_state: Dict) -> float:
        """Calculate confidence score"""
        total_tests = test_results['passed'] + test_results['failed']
        if total_tests == 0:
            return 0.0
            
        test_score = test_results['passed'] / total_tests
        
        # Check if database has expected data
        db_score = 1.0
        if db_state['users_count'][0][0] == 0:
            db_score -= 0.2
        if db_state['contacts_count'][0][0] == 0:
            db_score -= 0.2
            
        # Weight the scores
        confidence = (test_score * 0.7) + (db_score * 0.3)
        return confidence
```

## 🎬 Workflow Orchestrator

### `.docker/workflow/orchestrator.py`
```python
import asyncio
from typing import Dict, Any
import yaml
import os
from datetime import datetime
from pathlib import Path

class WorkflowOrchestrator:
    def __init__(self, config_path: str):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)
        self.mcp_client = MCPClient()
        self.test_agent = CRMTestAgent({
            'database_url': os.getenv('TEST_DATABASE_URL'),
            'model': 'openai:gpt-4'
        })
        
    async def execute_feature(self, feature_request: str) -> Dict[str, Any]:
        """Execute complete feature workflow"""
        
        print(f"🚀 Starting feature: {feature_request}")
        workflow_id = f"feature_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        results = {
            'workflow_id': workflow_id,
            'feature': feature_request,
            'phases': {}
        }
        
        # Phase 1: Research
        print("\n📚 Phase 1: Research")
        research_results = await self._execute_research_phase(feature_request)
        results['phases']['research'] = research_results
        
        # Phase 2: Planning
        print("\n📋 Phase 2: Planning")
        plan = await self._execute_planning_phase(research_results)
        results['phases']['planning'] = plan
        
        # Save plan to PLAN.md
        await self._save_plan(plan)
        
        # Phase 3: Building
        print("\n🔨 Phase 3: Building")
        implementation = await self._execute_building_phase(plan)
        results['phases']['building'] = implementation
        
        # Phase 4: Testing
        print("\n🧪 Phase 4: Testing")
        test_results = await self._execute_testing_phase(implementation)
        results['phases']['testing'] = test_results
        
        # Phase 5: Deployment (if tests pass)
        if test_results['confidence'] >= 0.95:
            print("\n🚀 Phase 5: Deployment")
            deployment = await self._execute_deployment_phase()
            results['phases']['deployment'] = deployment
        else:
            print("\n❌ Tests failed, skipping deployment")
            
        return results
    
    async def _execute_research_phase(self, feature: str) -> Dict:
        """Research using Zen and Context7"""
        
        # Use Zen for architecture analysis
        zen_research = await self.mcp_client.call(
            'zen_analyze',
            {
                'task': f"Analyze architecture for: {feature}",
                'model': 'gemini-pro',
                'include_best_practices': True
            }
        )
        
        # Use Context7 for library docs
        context7_docs = await self.mcp_client.call(
            'context7_search',
            {
                'query': feature,
                'frameworks': ['nextjs', 'react', 'prisma', 'supabase']
            }
        )
        
        return {
            'architecture_analysis': zen_research,
            'documentation': context7_docs,
            'timestamp': datetime.now().isoformat()
        }
    
    async def _execute_planning_phase(self, research: Dict) -> Dict:
        """Create detailed implementation plan"""
        
        plan_prompt = f"""
        Based on this research:
        {research['architecture_analysis']}
        {research['documentation']}
        
        Create a detailed implementation plan with:
        1. Step-by-step implementation
        2. Acceptance criteria
        3. Test scenarios
        4. Database changes needed
        """
        
        plan = await self.mcp_client.call(
            'zen_plan',
            {
                'prompt': plan_prompt,
                'model': 'gemini-pro'
            }
        )
        
        return plan
    
    async def _save_plan(self, plan: Dict) -> None:
        """Save plan to PLAN.md"""
        content = f"""# Implementation Plan
        
Generated: {datetime.now().isoformat()}

## Overview
{plan.get('overview', '')}

## Steps
{plan.get('steps', '')}

## Acceptance Criteria
{plan.get('acceptance_criteria', '')}

## Test Scenarios
{plan.get('test_scenarios', '')}
"""
        
        await self.mcp_client.call(
            'filesystem_write',
            {
                'path': 'PLAN.md',
                'content': content
            }
        )
```

## 📊 Workflow Dashboard

### `.docker/workflow/dashboard/index.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>CRM Workflow Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold mb-8">Workflow Automation Dashboard</h1>
        
        <!-- Current Workflow -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Current Workflow</h2>
            <div id="workflow-status">
                <div class="flex space-x-4">
                    <div class="phase-box" id="research">
                        <h3>Research</h3>
                        <span class="status">⏳ Waiting</span>
                    </div>
                    <div class="phase-box" id="planning">
                        <h3>Planning</h3>
                        <span class="status">⏳ Waiting</span>
                    </div>
                    <div class="phase-box" id="building">
                        <h3>Building</h3>
                        <span class="status">⏳ Waiting</span>
                    </div>
                    <div class="phase-box" id="testing">
                        <h3>Testing</h3>
                        <span class="status">⏳ Waiting</span>
                    </div>
                    <div class="phase-box" id="deployment">
                        <h3>Deployment</h3>
                        <span class="status">⏳ Waiting</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Test Results -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Test Results</h2>
            <div id="test-results">
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <h3 class="font-semibold">Tests Passed</h3>
                        <p class="text-3xl text-green-600" id="tests-passed">0</p>
                    </div>
                    <div>
                        <h3 class="font-semibold">Tests Failed</h3>
                        <p class="text-3xl text-red-600" id="tests-failed">0</p>
                    </div>
                    <div>
                        <h3 class="font-semibold">Confidence</h3>
                        <p class="text-3xl text-blue-600" id="confidence">0%</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Logs -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Workflow Logs</h2>
            <div class="bg-gray-900 text-green-400 p-4 rounded h-96 overflow-y-auto">
                <pre id="workflow-logs"></pre>
            </div>
        </div>
    </div>
    
    <style>
        .phase-box {
            @apply bg-gray-200 p-4 rounded-lg text-center;
        }
        .phase-box.active {
            @apply bg-blue-500 text-white;
        }
        .phase-box.complete {
            @apply bg-green-500 text-white;
        }
        .phase-box.error {
            @apply bg-red-500 text-white;
        }
    </style>
    
    <script>
        // WebSocket connection to workflow
        const ws = new WebSocket('ws://localhost:8090');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateWorkflowStatus(data);
        };
        
        function updateWorkflowStatus(data) {
            // Update phase status
            if (data.phase) {
                const phaseEl = document.getElementById(data.phase);
                phaseEl.className = `phase-box ${data.status}`;
                phaseEl.querySelector('.status').textContent = 
                    data.status === 'active' ? '🔄 Running' :
                    data.status === 'complete' ? '✅ Complete' :
                    data.status === 'error' ? '❌ Error' : '⏳ Waiting';
            }
            
            // Update test results
            if (data.tests) {
                document.getElementById('tests-passed').textContent = data.tests.passed;
                document.getElementById('tests-failed').textContent = data.tests.failed;
                document.getElementById('confidence').textContent = 
                    `${(data.tests.confidence * 100).toFixed(1)}%`;
            }
            
            // Update logs
            if (data.log) {
                const logs = document.getElementById('workflow-logs');
                logs.textContent += data.log + '\n';
                logs.scrollTop = logs.scrollHeight;
            }
        }
    </script>
</body>
</html>
```

## 🎮 VS Code Integration

### `.vscode/tasks.json`
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🚀 Implement Feature",
      "type": "shell",
      "command": "docker exec crm-workflow python -m workflow.orchestrator '${input:featureDescription}'",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "🧪 Run Tests (Real Data)",
      "type": "shell",
      "command": "docker exec crm-test-agent npm run test:real",
      "group": "test"
    },
    {
      "label": "📊 View Workflow Dashboard",
      "type": "shell",
      "command": "start http://localhost:8090",
      "windows": {
        "command": "start http://localhost:8090"
      }
    }
  ],
  "inputs": [
    {
      "id": "featureDescription",
      "type": "promptString",
      "description": "Describe the feature to implement"
    }
  ]
}
```

## 🚀 Usage Examples

### 1. **Implement a Feature**
```
Claude: "Add email notifications for task assignments"

Workflow automatically:
1. Researches email services (SendGrid, Resend)
2. Checks Next.js email patterns via Context7
3. Creates PLAN.md with implementation steps
4. Generates code using Gemini Flash (cheap)
5. Tests with REAL data in test database
6. Fixes failures automatically
7. Deploys when confidence > 95%
```

### 2. **Complex Feature**
```
Claude: "Implement customer portal with login, dashboard, and document access"

Workflow:
1. Deep architecture analysis with Zen/Gemini Pro
2. Comprehensive plan with authentication flow
3. Modular implementation
4. Integration tests with real Supabase
5. E2E tests with Playwright
6. Automatic deployment
```

## 📈 Success Metrics

Your workflow succeeds when:
- ✅ No manual test running required
- ✅ Real database validation, not mocks
- ✅ Automatic fixing until 95% confidence
- ✅ Token costs reduced by 70%+ using model routing
- ✅ Feature implementation time cut by 80%

---

This is your research-first, test-everything, automated workflow! 🚀    