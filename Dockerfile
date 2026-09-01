FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build frontend if it exists
RUN if [ -d "frontend" ]; then cd frontend && npm install && npm run build; fi

EXPOSE 4000

CMD ["node", "server.js"]
