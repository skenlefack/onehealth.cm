#!/bin/sh
set -e

# Create upload directories in the mounted volume (may run as root or expressjs)
dirs="experts organizations materials documents documents/files thumbnails elearning elearning/videos elearning/thumbnails elearning/pdfs elearning/attachments elearning/presentations"

for dir in $dirs; do
  mkdir -p "/app/uploads/$dir"
done

# Fix ownership if running as root (Docker volume mount case)
if [ "$(id -u)" = "0" ]; then
  # Ensure all dirs and files are writable by the expressjs user
  chown -R expressjs:nodejs /app/uploads
  chmod -R 755 /app/uploads
  exec su-exec expressjs node server.js
else
  exec node server.js
fi
