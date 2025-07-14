#!/usr/bin/env python3
"""
Install Context7 MCP using our existing Zen MCP infrastructure
"""
import json
import subprocess

def ask_zen_about_context7():
    """Ask Zen to research Context7 MCP and provide installation guidance"""
    
    print("=== ASKING ZEN ABOUT CONTEXT7 MCP ===")
    
    try:
        process = subprocess.Popen(
            ['docker', 'exec', '-i', 'crm-zen-mcp', 'python', '/app/server.py'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Ask Zen to research Context7 MCP
        requests = [
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "test", "version": "1.0"}
                }
            },
            {
                "jsonrpc": "2.0",
                "method": "notifications/initialized"
            },
            {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "analyze",
                    "arguments": {
                        "prompt": "Research Context7 MCP server: What is it, how to install it via npm, what does it do for context management, and how to integrate it with existing MCP setups. Provide specific installation commands and configuration details."
                    }
                }
            }
        ]
        
        input_data = '\n'.join(json.dumps(req) for req in requests) + '\n'
        
        print("Asking Zen to research Context7 MCP...")
        
        stdout, stderr = process.communicate(input=input_data, timeout=90)
        
        # Parse response
        for line in stdout.strip().split('\n'):
            if line.strip():
                try:
                    response = json.loads(line)
                    
                    if (response.get('id') == 2 and 
                        'result' in response and
                        'content' in response['result'] and
                        not response['result'].get('isError')):
                        
                        content = response['result']['content']
                        if isinstance(content, list) and content:
                            zen_analysis = content[0].get('text', '')
                        else:
                            zen_analysis = str(content)
                        
                        if zen_analysis and 'validation error' not in zen_analysis.lower():
                            print("\n" + "="*80)
                            print("ZEN'S RESEARCH ON CONTEXT7 MCP:")
                            print("="*80)
                            print(zen_analysis)
                            print("="*80)
                            return True
                        
                except json.JSONDecodeError:
                    continue
        
        print("No research results received")
        return False
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    ask_zen_about_context7()