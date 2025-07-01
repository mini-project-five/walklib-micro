#!/bin/bash

# Docker Port Conflict Checker for WalkLib Micro Services

echo "🔍 Docker Port Conflict Checker for WalkLib Micro Services"
echo "============================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Expected port mappings
declare -A EXPECTED_PORTS=(
    ["walklib_zookeeper"]="2181:2181"
    ["walklib_kafka"]="9092:9092"
    ["walklib_user_management"]="8082:8080"
    ["walklib_point_management"]="8083:8080"
    ["walklib_subscription_management"]="8084:8080"
    ["walklib_book_management"]="8085:8080"
    ["walklib_author_management"]="8086:8080"
    ["walklib_content_writing_management"]="8087:8080"
    ["walklib_ai_system_management"]="8089:8080"
    ["walklib_gateway"]="8088:8080"
    ["walklib_frontend"]="3000:80"
)

# Check for port conflicts on host
echo "🌐 Checking host port availability..."
CONFLICTED_PORTS=()

for container in "${!EXPECTED_PORTS[@]}"; do
    host_port=$(echo "${EXPECTED_PORTS[$container]}" | cut -d':' -f1)
    
    # Check if port is already in use
    if netstat -tuln 2>/dev/null | grep -q ":$host_port "; then
        process=$(lsof -ti:$host_port 2>/dev/null)
        if [ ! -z "$process" ]; then
            process_info=$(ps -p $process -o comm= 2>/dev/null)
            echo "⚠️  Port $host_port is already in use by process: $process_info (PID: $process)"
            CONFLICTED_PORTS+=($host_port)
        fi
    else
        echo "✅ Port $host_port is available"
    fi
done

if [ ${#CONFLICTED_PORTS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Port conflicts detected on ports: ${CONFLICTED_PORTS[*]}"
    echo "🛠️  To kill conflicting processes:"
    for port in "${CONFLICTED_PORTS[@]}"; do
        process=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$process" ]; then
            echo "   kill -9 $process  # (Port $port)"
        fi
    done
    echo ""
fi

echo ""
echo "🐳 Checking Docker containers..."

# Check running containers
RUNNING_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}")
echo "$RUNNING_CONTAINERS"

echo ""
echo "🔗 Checking container connectivity..."

# Function to check service health
check_service_health() {
    local container_name=$1
    local health_endpoint=$2
    local expected_port=$3
    
    if docker ps --filter "name=$container_name" --filter "status=running" | grep -q $container_name; then
        echo -n "Checking $container_name... "
        
        # Try to reach the health endpoint
        if curl -s "http://localhost:$expected_port$health_endpoint" > /dev/null 2>&1; then
            echo "✅ Healthy"
        else
            echo "❌ Unhealthy or not responding"
            # Show container logs (last 5 lines)
            echo "   Last 5 log lines:"
            docker logs --tail 5 $container_name 2>&1 | sed 's/^/   /'
        fi
    else
        echo "❌ $container_name is not running"
    fi
}

# Check core services
if docker ps --filter "name=walklib_kafka" --filter "status=running" | grep -q walklib_kafka; then
    echo "✅ Kafka container is running"
else
    echo "❌ Kafka container is not running - this will cause all services to fail"
fi

# Check application services
check_service_health "walklib_user_management" "/actuator/health" "8082"
check_service_health "walklib_gateway" "/actuator/health" "8088"
check_service_health "walklib_ai_system_management" "/actuator/health" "8089"

echo ""
echo "📊 Port mapping summary:"
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep walklib

echo ""
echo "🏥 Container resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep walklib

echo ""
echo "🔧 Quick commands:"
echo "   Stop all services:     docker-compose -f ../build-docker-compose.yml down"
echo "   View logs:             docker-compose -f ../build-docker-compose.yml logs [service-name]"
echo "   Restart service:       docker-compose -f ../build-docker-compose.yml restart [service-name]"
echo "   Kill port conflicts:   ./kill-port-conflicts.sh"
echo ""
echo "✨ Port conflict check completed!"