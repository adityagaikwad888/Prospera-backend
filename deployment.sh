#!/bin/bash

# Start time
START_TIME=$(date +%s)

# Create logs directory if not exists
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

# Define log file with timestamp
LOG_FILE="$LOG_DIR/deploy-$(date +'%Y%m%d-%H%M%S').log"

# Function to log with timestamps
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $@" | tee -a "$LOG_FILE"
}

BACKEND_IMAGE=adityagaikwad888/prospera-backend:latest
FRONTEND_IMAGE=adityagaikwad888/prospera-frontend:latest
NETWORK_NAME=prospera-container-network
ENV_FILE="/home/ec2-user/.env"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

BACKEND_CONTAINER=prospera-backend-$TIMESTAMP
FRONTEND_CONTAINER=prospera-frontend-$TIMESTAMP

# check docker 
if ! sudo docker info > /dev/null 2>&1; then
    log "Docker is not running. Please start Docker and try again."
    exit 1
fi

# # check nginx
# if ! pgrep nginx > /dev/null; then
#     log "NGINX is not running. Attempting to start it..."
#     sudo systemctl start nginx
#     sleep 2
#     if ! pgrep nginx > /dev/null; then
#         log "Failed to start NGINX. Please check NGINX configuration."
#         exit 1
#     else
#         log "NGINX started successfully."
#     fi
# fi

# Check if curl is installed
if ! command -v curl &> /dev/null; then
  log "curl not found! Please install curl to enable health checks."
  exit 1
fi

# Check if the .env file exists
if [ ! -f "$ENV_FILE" ]; then
  log "Environment file $ENV_FILE not found!"
  exit 1
fi


# Check if the network exists, if not create it
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    log "Creating Docker network: $NETWORK_NAME"
    docker network create -d bridge $NETWORK_NAME
else
    log "Docker network $NETWORK_NAME already exists."
fi

# pulling the latest images
log "Pulling the latest images..."
docker pull $BACKEND_IMAGE
docker pull $FRONTEND_IMAGE

# Cleanup old containers
log "Cleaning up old containers..."
OLD_CONTAINERS=$(docker ps -a -q --filter name=prospera-backend --filter name=prospera-frontend)
if [ ! -z "$OLD_CONTAINERS" ]; then
    log "Stopping and removing old containers..."
    docker stop $OLD_CONTAINERS > /dev/null 2>&1 || true
    docker rm -f $OLD_CONTAINERS > /dev/null 2>&1 || true
else
    log "No old containers to clean up."
fi


# Deploying the backend container
log "Deploying backend container..."
BACKEND_CONTAINER_ID=$(docker run -d --name $BACKEND_CONTAINER --env-file $ENV_FILE --network $NETWORK_NAME -p 3001:3001 $BACKEND_IMAGE)

# Check backend health status ... any crashed inside or not
# Wait for backend to become healthy
log "Waiting for backend to become healthy..."
for i in {1..10}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/HealthCheck)
  if [ "$STATUS" == "200" ]; then
    log "Backend is healthy and serving."
    break
  fi
  log "Attempt $i: Backend not ready (status: $STATUS). Retrying in 2s..."
  sleep 2
done

if [ "$STATUS" != "200" ]; then
  log "Backend failed health check after multiple attempts. Exiting."
  exit 1
fi


log "Backend container deployed with ID: $BACKEND_CONTAINER_ID"

# Deploying the frontend container
log "Deploying frontend container..."
FRONTEND_CONTAINER_ID=$(docker run -d --name $FRONTEND_CONTAINER --env-file $ENV_FILE --network $NETWORK_NAME -p 3000:3000 $FRONTEND_IMAGE)

sleep 5

if [ $? -ne 0 ]; then
    log "Failed to deploy frontend container."
    exit 1
fi

log "Frontend container deployed with ID: $FRONTEND_CONTAINER_ID"

# Done
log "==============================================="
log "------------> Backend and Frontend containers deployed! <------------"
log "NGINX running on host should now serve frontend."
log "Backend and frontend are both on Docker network: $NETWORK_NAME"
log "==============================================="

# Cleanup old images ...
log "Cleaning up old images..."
docker image prune -f > /dev/null 2>&1 || true
log "Old images cleaned up."
log "==============================================="
log "------------> Deployment completed successfully! <------------"
log "==============================================="


# Log the runtime
END_TIME=$(date +%s)
RUNTIME=$((END_TIME - START_TIME))
log "Script finished in $RUNTIME seconds."