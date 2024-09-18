ARG FRONTEND_URL="localhost:3000"
ARG BACKEND_URL="http://localhost:8080"

FROM nginx:alpine

ARG FRONTEND_URL
ARG BACKEND_URL

ENV FRONTEND_URL=${FRONTEND_URL}
ENV BACKEND_URL=${BACKEND_URL}

COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

COPY ./dist /usr/share/nginx/html/

EXPOSE 80 443

RUN echo "FRONTEND_URL is: $FRONTEND_URL" && echo "BACKEND_URL is: $BACKEND_URL"


CMD /bin/sh -c "envsubst '\$FRONTEND_URL \$BACKEND_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"

