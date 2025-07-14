@echo off
echo Starting CRM Application...
echo.

echo Checking if MCP server is running...
curl -s http://localhost:3030/api/health > nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MCP server is not running on port 3030
    echo Please start the MCP server first with: node mcp-server.js
    echo.
)

echo Starting Next.js development server...
npm run dev