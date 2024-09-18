ARG FRONTEND_URL="localhost:3000"
ARG BACKEND_URL="localhost:8080"

FROM nginx:alpine

COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

COPY ./dist /usr/share/nginx/html/

EXPOSE 80 443

CMD ["/bin/sh", "-c", "envsubst '\${FRONTEND_URL} $\{BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]

