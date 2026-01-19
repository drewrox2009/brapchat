# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY data/package.json ./data/package.json
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate --schema "data/prisma/schema.prisma"
RUN npx nx build api

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist/api ./dist/api
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/api/main.js"]
