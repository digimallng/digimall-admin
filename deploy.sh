#!/bin/bash

# DigiMall Admin App Deployment Script
# This script should be run on the EC2 server

set -e

# Configuration
APP_NAME="digimall-admin"
APP_PATH="/home/ubuntu/digimall-admin"
COMPOSE_FILE="docker-compose.prod.yml"
SERVICE_NAME="app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    DOCKER_CMD="docker"
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_CMD="sudo docker"
    DOCKER_COMPOSE_CMD="sudo docker-compose"
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if ss -tuln | grep -q ":$port "; then
        warn "Port $port is already in use"
        echo "Services using port $port:"
        ss -tuln | grep ":$port "
        return 1
    fi
    return 0
}

# Function to stop containers
stop_containers() {
    log "Stopping existing containers..."
    cd "$APP_PATH"
    
    if [ -f "$COMPOSE_FILE" ]; then
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" down --timeout 30 || warn "No containers to stop"
    else
        warn "Docker compose file not found, checking for running containers manually"
        RUNNING_CONTAINERS=$($DOCKER_CMD ps --filter "name=$APP_NAME" -q)
        if [ ! -z "$RUNNING_CONTAINERS" ]; then
            log "Stopping containers: $RUNNING_CONTAINERS"
            $DOCKER_CMD stop $RUNNING_CONTAINERS
            $DOCKER_CMD rm $RUNNING_CONTAINERS
        fi
    fi
}

# Function to start containers
start_containers() {
    log "Starting application containers..."
    cd "$APP_PATH"
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Docker compose file $COMPOSE_FILE not found"
        exit 1
    fi
    
    # Start containers in detached mode
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d
    
    # Wait for containers to start
    sleep 10
    
    # Check if containers are running
    RUNNING_CONTAINERS=$($DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" ps --services --filter "status=running" | wc -l)
    if [ "$RUNNING_CONTAINERS" -eq 0 ]; then
        error "No containers are running after deployment"
        log "Container logs:"
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs
        exit 1
    fi
    
    log "Application containers started successfully"
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    cd "$APP_PATH"
    
    # Show container status
    log "Container status:"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" ps
    
    # Test application health
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts..."
        if curl -f -s http://localhost:4300 >/dev/null 2>&1; then
            log "✅ Application is healthy and responding"
            return 0
        else
            warn "Application not ready yet, waiting 10 seconds..."
            sleep 10
            ((attempt++))
        fi
    done
    
    error "Application health check failed after $max_attempts attempts"
    log "Recent logs:"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs --tail=20
    return 1
}

# Function to show application info
show_info() {
    log "Deployment completed successfully!"
    echo ""
    echo "Application Information:"
    echo "  Name: DigiMall Admin Portal"
    echo "  Local URL: http://localhost:4300"
    echo "  Public URL: https://admin.digimall.ng"
    echo "  Container: $APP_NAME"
    echo "  Path: $APP_PATH"
    echo ""
    echo "Useful commands:"
    echo "  View logs: $DOCKER_COMPOSE_CMD -f $APP_PATH/$COMPOSE_FILE logs -f"
    echo "  Restart: $DOCKER_COMPOSE_CMD -f $APP_PATH/$COMPOSE_FILE restart"
    echo "  Stop: $DOCKER_COMPOSE_CMD -f $APP_PATH/$COMPOSE_FILE down"
    echo "  Status: $DOCKER_COMPOSE_CMD -f $APP_PATH/$COMPOSE_FILE ps"
}

# Function to cleanup old images
cleanup_images() {
    log "Cleaning up old Docker images..."
    # Remove dangling images
    DANGLING_IMAGES=$($DOCKER_CMD images -f "dangling=true" -q)
    if [ ! -z "$DANGLING_IMAGES" ]; then
        log "Removing dangling images..."
        $DOCKER_CMD rmi $DANGLING_IMAGES
    else
        log "No dangling images to remove"
    fi
}

# Main deployment function
deploy() {
    log "Starting deployment of DigiMall Admin App..."
    
    # Create app directory if it doesn't exist
    if [ ! -d "$APP_PATH" ]; then
        log "Creating application directory: $APP_PATH"
        mkdir -p "$APP_PATH"
        chown -R ubuntu:ubuntu "$APP_PATH"
    fi
    
    # Check port availability
    if ! check_port 4300; then
        warn "Port 4300 is in use, deployment may conflict with existing services"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Deployment cancelled by user"
            exit 1
        fi
    fi
    
    # Stop existing containers
    stop_containers
    
    # Start new containers
    start_containers
    
    # Verify deployment
    if verify_deployment; then
        cleanup_images
        show_info
    else
        error "Deployment verification failed"
        exit 1
    fi
}

# Script entry point
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    stop)
        stop_containers
        ;;
    start)
        start_containers
        ;;
    restart)
        stop_containers
        start_containers
        ;;
    status)
        cd "$APP_PATH"
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" ps
        ;;
    logs)
        cd "$APP_PATH"
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs -f
        ;;
    verify)
        verify_deployment
        ;;
    cleanup)
        cleanup_images
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|status|logs|verify|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  start    - Start containers"
        echo "  stop     - Stop containers"
        echo "  restart  - Restart containers"
        echo "  status   - Show container status"
        echo "  logs     - Show and follow container logs"
        echo "  verify   - Verify deployment health"
        echo "  cleanup  - Clean up old Docker images"
        exit 1
        ;;
esac