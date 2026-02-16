# Multistage Dockerfile - Producción optimizada

# Stage 1: Build
FROM node:24-alpine AS builder

LABEL maintainer="alyson-lau@github.com" \
      version="1.0.0" \
      description="Cadena de Suministros Backend"

WORKDIR /app

# Instalar solo dependencias de build
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Runtime
FROM node:24-alpine

# Variables de seguridad
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar solo lo necesario del builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código de la app
COPY --chown=nodejs:nodejs . .

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/status', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Usar usuario no-root
USER nodejs

# Comando de inicio
CMD ["node", "server.js"]
