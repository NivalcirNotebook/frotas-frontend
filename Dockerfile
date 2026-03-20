# Multi-stage build para o Frontend React

# Estágio 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio 2: Servir com nginx
FROM nginx:alpine

# Copiar build para nginx
COPY --from=build /app/build /usr/share/nginx/html

# Configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
