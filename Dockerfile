FROM node:20-slim

WORKDIR /app

# Install system deps for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy backend deps
COPY package.json package-lock.json ./
RUN npm install --production

# Copy frontend dist (pre-built)
COPY frontend/dist/ ./frontend/dist/

# Copy backend source
COPY server.js ./
COPY db/ ./db/
COPY lib/ ./lib/
COPY routes/ ./routes/

EXPOSE $PORT

CMD ["node", "server.js"]
