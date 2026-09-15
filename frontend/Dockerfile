# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Vite inlines env vars at build time, so they must be present before `npm run build`
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies first so this layer is cached unless the lockfile changes
COPY package*.json ./
RUN npm ci

# Copy source (node_modules and dist are excluded by .dockerignore)
COPY . .

RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:alpine

# Copy build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]