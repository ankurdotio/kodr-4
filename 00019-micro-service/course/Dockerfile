FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm install

COPY --chown=node:node server.js ./

USER node

EXPOSE 3001

CMD ["npm", "run", "dev"]
