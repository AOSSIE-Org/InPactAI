FROM python:3.14-alpine AS builder

WORKDIR /app

# Install system dependencies for building Python packages
RUN apk add --no-cache gcc musl-dev libffi-dev

# Copy requirement files
COPY requirements.txt .

# Install dependencies into a temp directory
RUN pip install --user -r requirements.txt


FROM python:3.14-alpine

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /root/.local /root/.local

# Ensure Python sees installed packages
ENV PATH=/root/.local/bin:$PATH

# Copy FastAPI app
COPY . .

# Copy .env into container
COPY .env .env

# Expose API port
EXPOSE 8000

# Start using Uvicorn workers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

