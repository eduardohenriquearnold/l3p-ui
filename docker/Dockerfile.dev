FROM node:10

ARG YOUR_APP_WEB_HTTP_PORT=8080

#Install Vue CLI
RUN npm install -g @vue/cli

WORKDIR /app

#Copy package requirements and install them
COPY package.json ./
RUN npm install

#Remove unnecessary files
RUN apt-get autoremove -y \
    && apt-get autoclean -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

EXPOSE ${YOUR_APP_WEB_HTTP_PORT}

USER node

#Run container in server mode
CMD ["npm", "run", "serve"]
