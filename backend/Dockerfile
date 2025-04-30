FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install -g @nestjs/cli

RUN npm ci --omit=dev

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]