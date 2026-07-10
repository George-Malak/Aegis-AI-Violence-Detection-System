FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p uploads/videos uploads/frames data

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "server.js"]
