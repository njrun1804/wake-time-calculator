# Multi-stage build for lightweight production image
FROM nginx:alpine

# Copy application files
COPY src/index.html /usr/share/nginx/html/
COPY src/css /usr/share/nginx/html/css
COPY src/js /usr/share/nginx/html/js

# Add nginx config for SPA routing
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
