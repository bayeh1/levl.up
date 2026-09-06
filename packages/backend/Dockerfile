FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm ci
WORKDIR /app/packages/backend
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
