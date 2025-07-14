FROM node:20-alpine

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll use the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Install Puppeteer MCP server
RUN npm install -g @modelcontextprotocol/server-puppeteer

# Set Docker container flag
ENV DOCKER_CONTAINER=true

# Keep container running
CMD ["tail", "-f", "/dev/null"]