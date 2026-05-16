# Local development image for the Hapi app.
FROM node:22-bookworm-slim

WORKDIR /app

# Install deps first so this layer caches between source edits.
COPY package*.json ./
RUN npm ci

# Source is bind-mounted by docker compose for hot reload; the COPY here keeps
# the image runnable standalone (e.g. `docker build . && docker run`).
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
