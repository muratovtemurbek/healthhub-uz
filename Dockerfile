# Stage 1: Build Frontend
# Cache bust: v3 - force rebuild
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy ALL frontend files first to bust cache
COPY frontend/ .

# Install and build
RUN npm install && npm run build && ls -la dist/

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
