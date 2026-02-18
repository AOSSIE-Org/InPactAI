# Use a stable Python base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system-level dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the Backend folder and install
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . .

# Set environment variables (standard for AI platforms)
ENV PYTHONUNBUFFERED=1

# Change to the Backend directory to run the application
WORKDIR /app/Backend