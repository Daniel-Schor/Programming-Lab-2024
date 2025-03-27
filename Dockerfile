# Use minimal Node base image
FROM node:20.11.1-alpine

# Set working directory
WORKDIR /app

# Only copy what's needed
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app only
COPY dist ./dist

# Also copy views if needed
COPY src/frontend ./src/frontend

# Copy .env if needed (optional)
COPY .env .env



# App port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["node", "dist/backend/index.js"]
