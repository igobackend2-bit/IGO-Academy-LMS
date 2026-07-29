FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm --prefix client install --include=dev
RUN npm --prefix client run build

FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
