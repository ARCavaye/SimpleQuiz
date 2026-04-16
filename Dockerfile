# Dockerfile for SimpleQuiz (React frontend)
FROM node:25-alpine

WORKDIR /app

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY src ./src
COPY public ./public

RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "start"]
