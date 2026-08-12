FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm --prefix client install --include=dev

# Vite bakes VITE_* values into the compiled bundle at build time. `docker
# build` does not inherit the container's runtime environment variables, so
# this must come in as a build arg and be promoted to ENV before the build
# step can see it.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm --prefix client run build

FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
