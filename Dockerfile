FROM node:18-alpine

WORKDIR /app

# Copy everything (frontend/dist is pre-built)
COPY . .

# Install backend dependencies only
RUN npm install --omit=dev

EXPOSE 4000

CMD ["node", "server.js"]
