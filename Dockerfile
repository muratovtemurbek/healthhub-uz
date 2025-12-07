# Stage 1: Build Frontend
# Cache bust: v2
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend files
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN echo "Building frontend at $(date)" && npm run build

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
