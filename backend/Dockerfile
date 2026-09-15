# ---------- Stage 1: Install dependencies ----------
FROM node:22-alpine AS deps

WORKDIR /app

# Install only production dependencies inside the container
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Stage 2: Runtime ----------
FROM node:22-alpine

# wget for the healthcheck
RUN apk add --no-cache wget

WORKDIR /app

ENV NODE_ENV=production

# Reuse the dependencies compiled in the deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy application code (node_modules, .env, uploads, logs excluded by .dockerignore)
COPY --chown=node:node . .

# Create the directories that docker-compose mounts volumes onto
RUN mkdir -p uploads/documents uploads/images logs && \
    chown -R node:node uploads logs

USER node

EXPOSE 3000

# Healthcheck menembak GET /up (lihat src/app.js), bukan /health.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/up || exit 1

CMD ["npm", "start"]