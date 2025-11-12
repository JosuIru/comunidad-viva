FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && \
    npm install -g @nestjs/cli prisma

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Copiar desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Puerto
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Iniciar con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
