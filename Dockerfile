# Multi-stage build for lightweight production image
FROM nginx:alpine

# Copy application files
COPY src/index.html /usr/share/nginx/html/
COPY src/css /usr/share/nginx/html/css
COPY src/js /usr/share/nginx/html/js

# Add nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]