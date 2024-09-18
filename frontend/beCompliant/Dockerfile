ARG FRONTEND_URL
ARG BACKEND_URL

FROM nginx:alpine

COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

COPY ./dist /usr/share/nginx/html/

EXPOSE 80 443

CMD ["/bin/sh", "-c", "envsubst '${FRONTEND_URL} ${BACKEND_URL}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf && cat /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]

