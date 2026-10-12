FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY solver ./solver
RUN python3 -m venv /opt/solver && /opt/solver/bin/pip install --no-cache-dir -r solver/requirements.txt
COPY src ./src
COPY scripts/penjadwalan-worker.js ./scripts/penjadwalan-worker.js
ENV NODE_ENV=production PENJADWALAN_PYTHON=/opt/solver/bin/python
USER node
CMD ["node", "scripts/penjadwalan-worker.js"]
