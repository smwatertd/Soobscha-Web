FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=
ARG VITE_YANDEX_MAPS_JS_API_KEY=
ARG VITE_YANDEX_GEOCODER_API_KEY=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_YANDEX_MAPS_JS_API_KEY=$VITE_YANDEX_MAPS_JS_API_KEY \
    VITE_YANDEX_GEOCODER_API_KEY=$VITE_YANDEX_GEOCODER_API_KEY

RUN npm run build

FROM nginx:1.27-alpine AS runtime

ENV API_UPSTREAM=host.docker.internal:80

COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
