#!/bin/bash

# Enhanced Docker Start Script for WalkLib Micro Services

echo "🚀 Starting WalkLib Micro Services with Docker"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="../build-docker-compose.yml"
PRODUCTION_COMPOSE_FILE="../docker-compose.production.yml"

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Function to check and resolve port conflicts
check_port_conflicts() {
    echo ""
    echo "🔍 Checking for port conflicts..."
    
    REQUIRED_PORTS=(2181 9092 8082 8083 8084 8085 8086 8087 8088 8089 3000)
    CONFLICTS_FOUND=false
    
    for port in "${REQUIRED_PORTS[@]}"; do
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Port $port is in use${NC}"
            CONFLICTS_FOUND=true
        fi
    done
    
    if [ "$CONFLICTS_FOUND" = true ]; then
        echo ""
        echo -e "${YELLOW}Port conflicts detected. Options:${NC}"
        echo "1. Automatically kill conflicting processes (recommended)"
        echo "2. Manual resolution using ./kill-port-conflicts.sh"
        echo "3. Continue anyway (may cause failures)"
        echo "4. Exit"
        
        read -p "Choose option (1-4): " choice
        case $choice in
            1)
                echo "🔧 Automatically resolving port conflicts..."
                for port in "${REQUIRED_PORTS[@]}"; do
                    process=$(lsof -ti:$port 2>/dev/null)
                    if [ ! -z "$process" ]; then
                        if kill -9 $process 2>/dev/null; then
                            echo -e "${GREEN}✅ Killed process on port $port${NC}"
                        fi
                    fi
                done
                ;;
            2)
                echo "Please run: ./kill-port-conflicts.sh"
                exit 1
                ;;
            3)
                echo -e "${YELLOW}⚠️  Continuing with port conflicts...${NC}"
                ;;
            4)
                echo "Exiting..."
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice. Exiting...${NC}"
                exit 1
                ;;
        esac
    else
        echo -e "${GREEN}✅ No port conflicts detected${NC}"
    fi
}

# Function to select compose file
select_compose_file() {
    echo ""
    echo "📋 Select deployment mode:"
    echo "1. Development mode (build-docker-compose.yml) - Uses Maven with source mounting"
    echo "2. Production mode (docker-compose.production.yml) - Uses pre-built Docker images"
    
    read -p "Choose mode (1-2): " mode_choice
    case $mode_choice in
        1)
            SELECTED_COMPOSE_FILE="$COMPOSE_FILE"
            echo -e "${BLUE}🔧 Using development mode${NC}"
            ;;
        2)
            SELECTED_COMPOSE_FILE="$PRODUCTION_COMPOSE_FILE"
            echo -e "${BLUE}🏭 Using production mode${NC}"
            
            # Check if Docker images exist for production mode
            echo "📦 Checking if Docker images are built..."
            # This would require building images first
            echo -e "${YELLOW}⚠️  Production mode requires pre-built images${NC}"
            echo "Run './build-docker-images.sh' first if you haven't already"
            ;;
        *)
            echo -e "${RED}Invalid choice. Using development mode by default.${NC}"
            SELECTED_COMPOSE_FILE="$COMPOSE_FILE"
            ;;
    esac
}

# Function to start services
start_services() {
    echo ""
    echo "🚀 Starting WalkLib services..."
    echo "Using compose file: $SELECTED_COMPOSE_FILE"
    
    # Clean up any existing containers
    echo "🧹 Cleaning up existing containers..."
    docker-compose -f "$SELECTED_COMPOSE_FILE" down --remove-orphans
    
    # Start services in order
    echo "📦 Starting infrastructure services (Zookeeper, Kafka)..."
    docker-compose -f "$SELECTED_COMPOSE_FILE" up -d zookeeper kafka
    
    echo "⏳ Waiting for infrastructure to be ready..."
    sleep 10
    
    echo "🏗️  Starting backend microservices..."
    docker-compose -f "$SELECTED_COMPOSE_FILE" up -d \
        "user management" \
        "point management" \
        "subscription management" \
        "book management" \
        "author management" \
        "content writing management" \
        "ai system management"
    
    echo "⏳ Waiting for backend services to be ready..."
    sleep 15
    
    echo "🌐 Starting Gateway..."
    docker-compose -f "$SELECTED_COMPOSE_FILE" up -d gateway
    
    echo "⏳ Waiting for gateway to be ready..."
    sleep 10
    
    if [ "$SELECTED_COMPOSE_FILE" = "$COMPOSE_FILE" ]; then
        echo "🎨 Starting Frontend..."
        docker-compose -f "$SELECTED_COMPOSE_FILE" up -d frontend
    fi
    
    echo ""
    echo -e "${GREEN}✅ All services started!${NC}"
}

# Function to verify services
verify_services() {
    echo ""
    echo "🔍 Verifying service health..."
    sleep 5
    
    # Run health check
    if [ -f "./docker-health-check.sh" ]; then
        cd "$(dirname "$0")" && ./docker-health-check.sh
    else
        echo "Health check script not found. Manual verification:"
        docker-compose -f "$SELECTED_COMPOSE_FILE" ps
    fi
}

# Function to show access information
show_access_info() {
    echo ""
    echo -e "${GREEN}🎉 WalkLib services are now running!${NC}"
    echo ""
    echo "📱 Access Points:"
    echo "  Frontend:        http://localhost:3000"
    echo "  API Gateway:     http://localhost:8088"
    echo "  User Service:    http://localhost:8082"
    echo "  AI Service:      http://localhost:8089"
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs:       docker-compose -f $SELECTED_COMPOSE_FILE logs -f [service-name]"
    echo "  Stop services:   docker-compose -f $SELECTED_COMPOSE_FILE down"
    echo "  Restart service: docker-compose -f $SELECTED_COMPOSE_FILE restart [service-name]"
    echo "  Health check:    ./docker-health-check.sh"
    echo ""
    echo "🐳 Container Status:"
    docker-compose -f "$SELECTED_COMPOSE_FILE" ps
}

# Main execution
main() {
    check_prerequisites
    check_port_conflicts
    select_compose_file
    start_services
    verify_services
    show_access_info
    
    echo ""
    echo -e "${GREEN}✨ WalkLib startup completed successfully!${NC}"
    echo ""
    echo "💡 Pro tip: Keep this terminal open to monitor the startup process"
    echo "    Use Ctrl+C to stop monitoring, or run 'scripts/docker-health-check.sh' anytime"
}

# Handle script arguments
case "${1:-}" in
    --dev)
        SELECTED_COMPOSE_FILE="$COMPOSE_FILE"
        ;;
    --prod)
        SELECTED_COMPOSE_FILE="$PRODUCTION_COMPOSE_FILE"
        ;;
    --help|-h)
        echo "Usage: $0 [--dev|--prod|--help]"
        echo "  --dev   Force development mode"
        echo "  --prod  Force production mode"
        echo "  --help  Show this help"
        exit 0
        ;;
esac

# Run main function
main