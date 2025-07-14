@echo off
echo 🚀 Starting CRM Application...
echo.

echo 🔄 Starting MCP Server with HTTP API...
docker-compose up -d supabase-mcp
echo.

echo ⏳ Waiting for MCP Server to be ready...
timeout /t 5 /nobreak >nul
echo.

echo 🎯 Testing MCP Server HTTP API...
curl -s http://localhost:3030/api/health
echo.
echo.

echo 🌐 Starting Frontend Development Server...
echo 📱 Frontend will be available at: http://localhost:3000 (or next available port)
echo 📡 MCP HTTP API running on: http://localhost:3030
echo 🔗 API Health Check: http://localhost:3030/api/health
echo 📊 API Contacts: http://localhost:3030/api/contacts
echo.
echo Press Ctrl+C to stop all services
echo.

npm run dev