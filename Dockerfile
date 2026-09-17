FROM node:22-alpine
WORKDIR /app
COPY package.json server.js landing.html landing.css landing.js index.html styles.css app.js ./
RUN mkdir -p data
ENV PORT=4173
EXPOSE 4173
CMD ["node", "server.js"]
