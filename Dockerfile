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
# Optional -- leave unset until the Academy configures a reCAPTCHA site key;
# the form works normally either way (see client/src/hooks/useRecaptcha.js).
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

RUN npm --prefix client run build

FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
