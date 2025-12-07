# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy and install
COPY frontend/package*.json ./
RUN npm ci || npm install

# Copy source and build
COPY frontend/ .
ENV VITE_BUILD_TIME=${CACHEBUST:-v5}
RUN npm run build

# Debug - show built files
RUN ls -la dist/assets/

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

# Run migrations, seed data, set webhook, and start server
CMD python manage.py migrate && python seed_data.py && python set_webhook.py && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
