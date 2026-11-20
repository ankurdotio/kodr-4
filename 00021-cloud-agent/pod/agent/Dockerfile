FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY main.js ./
COPY src ./src
RUN mkdir -p /workshop && chown node:node /workshop
ENV NODE_ENV=production WORKSHOP_DIR=/workshop WORKSHOP_SERVER_URL=http://workshop:4000
USER node
CMD ["node", "main.js"]
