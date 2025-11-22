FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

FROM dependencies AS build
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src
RUN npm run build || npx tsc

FROM dependencies AS dev
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json tsconfig.json ./
COPY src ./src
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]