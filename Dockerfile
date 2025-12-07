# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

# Cache bust timestamp: 2024-12-07-v4
ARG CACHEBUST=1

WORKDIR /frontend

# Copy package files
COPY frontend/package*.json ./

# Clean install
RUN rm -rf node_modules package-lock.json && npm install

# Copy source files
COPY frontend/ .

# Build with timestamp
RUN echo "Build time: $(date)" > build-info.txt && npm run build && cat dist/index.html

# Stage 2: Python Backend
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend project
COPY backend/ .

# Copy frontend build to Django static
COPY --from=frontend-builder /frontend/dist /app/staticfiles/frontend

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run migrations, seed data, and start server
CMD python manage.py migrate && python seed_data.py && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
