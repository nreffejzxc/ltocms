# Use Node.js 18 LTS
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files first (for better caching)
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY --chown=nodejs:nodejs . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Render uses PORT env variable)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application with dumb-init
CMD ["dumb-init", "node", "dist/server.js"]