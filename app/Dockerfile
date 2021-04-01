FROM node:10.24.0-alpine
RUN mkdir /app
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
