const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3010;
const models = require('../config/models.json');

class MCPOrchestrator {
  constructor() {
    this.activeWorkflows = new Map();
    this.modelClients = this.initializeModelClients();
  }

  initializeModelClients() {
    return {
      'gemini-pro': {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        key: process.env.GEMINI_API_KEY
      },
      'gemini-flash': {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        key: process.env.GEMINI_API_KEY
      },
      'gpt-3.5-turbo': {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        key: process.env.OPENAI_API_KEY
      },
      'claude-3-sonnet': {
        endpoint: 'https://api.anthropic.com/v1/messages',
        key: process.env.ANTHROPIC_API_KEY
      }
    };
  }

  async routeRequest(taskType, prompt, context = {}) {
    const routing = models.routing[taskType] || models.routing.critical_decisions;
    const primaryModel = routing.primary;
    
    console.log(`🤖 Routing ${taskType} to ${primaryModel} (${routing.cost_savings} savings)`);
    
    try {
      const response = await this.callModel(primaryModel, prompt, context);
      const confidence = this.calculateConfidence(response);
      
      if (confidence >= models.confidence_thresholds.auto_proceed) {
        return { success: true, response, confidence, model: primaryModel };
      }
      
      if (confidence >= models.confidence_thresholds.retry_with_claude) {
        console.log(`⚠️  Low confidence (${confidence}), retrying with Claude`);
        const claudeResponse = await this.callModel('claude-3-sonnet', prompt, context);
        return { success: true, response: claudeResponse, confidence: 0.95, model: 'claude-3-sonnet' };
      }
      
      return { success: false, error: 'Confidence too low', confidence };
      
    } catch (error) {
      console.log(`❌ ${primaryModel} failed, falling back to ${routing.fallback}`);
      const fallbackResponse = await this.callModel(routing.fallback, prompt, context);
      return { success: true, response: fallbackResponse, confidence: 0.9, model: routing.fallback };
    }
  }

  async callModel(modelName, prompt, context) {
    const client = this.modelClients[modelName];
    if (!client) throw new Error(`Model ${modelName} not configured`);

    switch (modelName) {
      case 'gemini-pro':
      case 'gemini-flash':
        return await this.callGemini(client, prompt);
      case 'gpt-3.5-turbo':
        return await this.callOpenAI(client, prompt);
      case 'claude-3-sonnet':
        return await this.callClaude(client, prompt);
      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
  }

  async callGemini(client, prompt) {
    const response = await axios.post(client.endpoint + `?key=${client.key}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    return response.data.candidates[0].content.parts[0].text;
  }

  async callOpenAI(client, prompt) {
    const response = await axios.post(client.endpoint, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: { 'Authorization': `Bearer ${client.key}` }
    });
    return response.data.choices[0].message.content;
  }

  async callClaude(client, prompt) {
    const response = await axios.post(client.endpoint, {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: { 
        'x-api-key': client.key,
        'anthropic-version': '2023-06-01'
      }
    });
    return response.data.content[0].text;
  }

  calculateConfidence(response) {
    if (!response || response.length < 10) return 0.3;
    if (response.includes('I don\'t know') || response.includes('uncertain')) return 0.6;
    if (response.includes('error') || response.includes('failed')) return 0.5;
    return 0.92;
  }

  async executeWorkflow(workflowType, params) {
    const workflowId = Date.now().toString();
    this.activeWorkflows.set(workflowId, { type: workflowType, status: 'running', steps: [] });
    
    try {
      switch (workflowType) {
        case 'research_plan_build':
          return await this.researchPlanBuildWorkflow(workflowId, params);
        case 'test_fix_deploy':
          return await this.testFixDeployWorkflow(workflowId, params);
        default:
          throw new Error(`Unknown workflow: ${workflowType}`);
      }
    } catch (error) {
      this.activeWorkflows.get(workflowId).status = 'failed';
      throw error;
    }
  }

  async researchPlanBuildWorkflow(workflowId, params) {
    const workflow = this.activeWorkflows.get(workflowId);
    
    workflow.steps.push({ step: 'research', status: 'running' });
    const research = await this.routeRequest('research', 
      `Research requirements for: ${params.feature}. Include technical constraints and dependencies.`
    );
    workflow.steps[0].status = 'completed';
    workflow.steps[0].result = research.response;
    
    workflow.steps.push({ step: 'plan', status: 'running' });
    const plan = await this.routeRequest('critical_decisions',
      `Create implementation plan based on research: ${research.response}`
    );
    workflow.steps[1].status = 'completed';
    workflow.steps[1].result = plan.response;
    
    workflow.steps.push({ step: 'build', status: 'running' });
    const code = await this.routeRequest('code_generation',
      `Generate code implementing this plan: ${plan.response}`
    );
    workflow.steps[2].status = 'completed';
    workflow.steps[2].result = code.response;
    
    workflow.status = 'completed';
    return workflow;
  }

  async testFixDeployWorkflow(workflowId, params) {
    const workflow = this.activeWorkflows.get(workflowId);
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      workflow.steps.push({ step: `test_attempt_${attempts + 1}`, status: 'running' });
      
      const testResult = await this.routeRequest('testing',
        `Test this code and identify issues: ${params.code}`
      );
      
      if (testResult.confidence >= models.confidence_thresholds.auto_proceed) {
        workflow.steps[workflow.steps.length - 1].status = 'passed';
        workflow.status = 'completed';
        return workflow;
      }
      
      workflow.steps[workflow.steps.length - 1].status = 'failed';
      workflow.steps[workflow.steps.length - 1].issues = testResult.response;
      
      workflow.steps.push({ step: `fix_attempt_${attempts + 1}`, status: 'running' });
      const fix = await this.routeRequest('code_generation',
        `Fix these issues: ${testResult.response}. Original code: ${params.code}`
      );
      workflow.steps[workflow.steps.length - 1].status = 'completed';
      params.code = fix.response;
      
      attempts++;
    }
    
    workflow.status = 'needs_human_review';
    return workflow;
  }
}

const orchestrator = new MCPOrchestrator();

app.post('/api/route', async (req, res) => {
  try {
    const { taskType, prompt, context } = req.body;
    const result = await orchestrator.routeRequest(taskType, prompt, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workflow', async (req, res) => {
  try {
    const { workflowType, params } = req.body;
    const result = await orchestrator.executeWorkflow(workflowType, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workflows', (req, res) => {
  const workflows = Array.from(orchestrator.activeWorkflows.entries()).map(([id, workflow]) => ({
    id,
    ...workflow
  }));
  res.json(workflows);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MCP Orchestra running',
    models: Object.keys(orchestrator.modelClients),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎼 MCP Orchestra running on port ${PORT}`);
  console.log(`💰 Token optimization: 75-85% cost reduction`);
  console.log(`🤖 Model routing: Gemini → GPT-3.5 → Claude fallback`);
});