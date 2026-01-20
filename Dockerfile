# --- Stage 1: Build ---
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Stage 2: Development ---
FROM build-stage AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# --- Stage 3: Production Build ---
FROM build-stage AS build-prod
RUN npm run build

# --- Stage 4: Production Serve ---
FROM nginx:stable-alpine AS production
# Static files from Vue build
COPY --from=build-prod /app/dist /usr/share/nginx/html
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
