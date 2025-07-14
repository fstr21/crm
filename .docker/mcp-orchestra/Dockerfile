FROM node:20-alpine AS base

RUN apk add --no-cache \
    python3 \
    py3-pip \
    git \
    curl \
    bash \
    jq

WORKDIR /mcp

COPY package*.json ./
RUN npm ci --only=production

FROM base AS mcp-servers

RUN npm install -g \
    @modelcontextprotocol/server-filesystem \
    @modelcontextprotocol/server-github

RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install \
    openai \
    anthropic \
    google-generativeai

ENV PATH="/opt/venv/bin:$PATH"

COPY config/ ./config/
COPY scripts/ ./scripts/

EXPOSE 3010-3020

CMD ["node", "scripts/orchestrator.js"]