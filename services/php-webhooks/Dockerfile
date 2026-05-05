FROM php:8.3-cli-alpine

WORKDIR /app
COPY . /app

RUN mkdir -p /app/storage/queue /app/storage/dead-letter

EXPOSE 8088
CMD ["php", "-S", "0.0.0.0:8088", "-t", "public"]
