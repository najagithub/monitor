FROM node:20

# Utiliser apk pour installer snmp au lieu de apt-get
RUN apt-get update -y && apt-get upgrade -y && apt-get install snmp -y && apt-get install nano -y && apt-get install sshpass -y

WORKDIR /app
COPY app/package.json .
RUN npm install --quiet
COPY app/ .

EXPOSE 3002

ENTRYPOINT ["npm", "start"]
