FROM node:20-bookworm-slim

WORKDIR /app

# Install build tools for better-sqlite3 native compilation
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE $PORT

CMD ["node", "server.js"]
