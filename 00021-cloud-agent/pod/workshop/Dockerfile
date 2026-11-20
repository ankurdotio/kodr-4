# Full Debian image includes the build tools node-pty needs and common CLIs for workshop commands.
FROM node:22-bookworm
WORKDIR /server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY src ./src
RUN mkdir -p /workshop && chown node:node /workshop
ENV NODE_ENV=production PORT=4000 WORKSHOP_DIR=/workshop
USER node
WORKDIR /workshop
EXPOSE 4000
CMD ["node", "/server/src/server.js"]
