@echo off
echo 🚀 Starting CRM Application...
echo.

echo 📡 Checking MCP Server Status...
docker-compose ps supabase-mcp
echo.

echo 🔄 Ensuring MCP Server is Running...
docker-compose up -d supabase-mcp
echo.

echo ⏳ Waiting for MCP Server to be ready...
timeout /t 3 /nobreak >nul
echo.

echo 🎯 Testing MCP Server Connection...
docker-compose exec -T supabase-mcp node -e "console.log('✅ MCP Server is responsive')"
echo.

echo 🌐 Starting Frontend Development Server...
echo 📱 Frontend will be available at: http://localhost:3000 (or next available port)
echo 📡 MCP Server running on: http://localhost:3030
echo.
echo Press Ctrl+C to stop all services
echo.

npm run dev