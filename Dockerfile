FROM node:20-bookworm-slim

WORKDIR /app

# Install build tools for native module compilation
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

# Force better-sqlite3 to compile from source (prebuilt binaries crash on Render)
RUN npm install --build-from-source

COPY . .

EXPOSE $PORT

CMD ["node", "server.js"]
