FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./dist /usr/share/nginx/html/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]