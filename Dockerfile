FROM node:20-alpine

WORKDIR /app

# Copy backend package files and install
COPY package.json package-lock.json ./
RUN npm install --production

# Copy frontend source and build
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Copy backend source (after frontend build to avoid rebuilding on backend changes)
COPY server.js ./
COPY db/ ./db/
COPY lib/ ./lib/
COPY routes/ ./routes/
COPY .env* ./

EXPOSE 8080

CMD ["node", "server.js"]
