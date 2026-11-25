FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY main.js ./
COPY src ./src
RUN chmod 755 src/task/askpass.sh
RUN mkdir -p /workshop && chown node:node /workshop
ENV NODE_ENV=production WORKSHOP_DIR=/workshop WORKSHOP_SERVER_URL=http://workshop:4000
USER node
CMD ["node", "main.js"]
