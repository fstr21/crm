FROM node:20-alpine
WORKDIR /app

# Install Context7 MCP
RUN npm install -g @upstash/context7-mcp

# Use tail -f /dev/null as a simple way to keep container running
CMD ["tail", "-f", "/dev/null"]