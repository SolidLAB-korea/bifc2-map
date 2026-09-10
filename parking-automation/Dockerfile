FROM mcr.microsoft.com/playwright:v1.55.0-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# The bot only uses outbound polling; no public HTTP port is exposed.
CMD ["npm", "run", "telegram"]
