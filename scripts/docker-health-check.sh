#!/bin/bash

# Docker Health Check Script for WalkLib Micro Services

echo "🏥 WalkLib Docker Services Health Check"
echo "======================================="

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configurations
declare -A SERVICES=(
    ["walklib_zookeeper"]="2181|/|Zookeeper"
    ["walklib_kafka"]="9092|/|Kafka"
    ["walklib_user_management"]="8082|/actuator/health|User Management"
    ["walklib_point_management"]="8083|/actuator/health|Point Management"
    ["walklib_subscription_management"]="8084|/actuator/health|Subscription Management"
    ["walklib_book_management"]="8085|/actuator/health|Book Management"
    ["walklib_author_management"]="8086|/actuator/health|Author Management"
    ["walklib_content_writing_management"]="8087|/actuator/health|Content Writing Management"
    ["walklib_ai_system_management"]="8089|/actuator/health|AI System Management"
    ["walklib_gateway"]="8088|/actuator/health|Gateway"
    ["walklib_frontend"]="3000|/|Frontend"
)

echo "📊 Container Status Check"
echo "------------------------"

ALL_HEALTHY=true

for service in "${!SERVICES[@]}"; do
    IFS='|' read -r port endpoint name <<< "${SERVICES[$service]}"
    
    printf "%-35s " "$name:"
    
    # Check if container is running
    if docker ps --filter "name=$service" --filter "status=running" --format "{{.Names}}" | grep -q "^${service}$"; then
        echo -e "${GREEN}RUNNING${NC} "
        
        # Check health endpoint
        if [ "$endpoint" = "/" ]; then
            # For non-Spring services, just check if port is responding
            if nc -z localhost $port 2>/dev/null; then
                echo -e "  Health: ${GREEN}✅ PORT OPEN${NC}"
            else
                echo -e "  Health: ${RED}❌ PORT CLOSED${NC}"
                ALL_HEALTHY=false
            fi
        else
            # For Spring services, check actuator health endpoint
            response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port$endpoint" 2>/dev/null)
            if [ "$response" = "200" ]; then
                echo -e "  Health: ${GREEN}✅ HEALTHY${NC}"
            else
                echo -e "  Health: ${RED}❌ UNHEALTHY (HTTP $response)${NC}"
                ALL_HEALTHY=false
            fi
        fi
    else
        echo -e "${RED}NOT RUNNING${NC}"
        ALL_HEALTHY=false
    fi
done

echo ""
echo "🔗 Service Connectivity Test"
echo "----------------------------"

# Test gateway connectivity to backend services
if docker ps --filter "name=walklib_gateway" --filter "status=running" | grep -q walklib_gateway; then
    echo "Testing Gateway → Backend Service Connectivity:"
    
    # Test user management through gateway
    printf "  Gateway → User Management: "
    if curl -s "http://localhost:8088/users" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
        ALL_HEALTHY=false
    fi
    
    # Test AI system through gateway
    printf "  Gateway → AI System: "
    if curl -s -X POST "http://localhost:8088/ai/summary" \
        -H "Content-Type: application/json" \
        -d '{"content":"test"}' >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
        ALL_HEALTHY=false
    fi
    
    # Test books through gateway
    printf "  Gateway → Book Management: "
    if curl -s "http://localhost:8088/books" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
        ALL_HEALTHY=false
    fi
else
    echo -e "${RED}❌ Gateway is not running - cannot test backend connectivity${NC}"
    ALL_HEALTHY=false
fi

echo ""
echo "📈 Resource Usage"
echo "----------------"

if docker ps --filter "name=walklib" --format "{{.Names}}" | head -1 >/dev/null; then
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" $(docker ps --filter "name=walklib" --format "{{.Names}}" | tr '\n' ' ')
else
    echo "No WalkLib containers are running"
fi

echo ""
echo "🐳 Container Logs (Recent Errors)"
echo "--------------------------------"

for service in "${!SERVICES[@]}"; do
    if docker ps --filter "name=$service" --filter "status=running" | grep -q $service; then
        error_logs=$(docker logs --tail 50 $service 2>&1 | grep -i -E "(error|exception|failed|fatal)" | tail -3)
        if [ ! -z "$error_logs" ]; then
            echo -e "${YELLOW}$service recent errors:${NC}"
            echo "$error_logs" | sed 's/^/  /'
            echo ""
        fi
    fi
done

echo ""
echo "🔧 Quick Actions"
echo "---------------"
echo "View specific service logs:    docker logs -f [container_name]"
echo "Restart a service:             docker-compose -f ../build-docker-compose.yml restart [service_name]"
echo "Stop all services:             docker-compose -f ../build-docker-compose.yml down"
echo "Start all services:            docker-compose -f ../build-docker-compose.yml up -d"
echo "Check port conflicts:          ./docker-port-check.sh"
echo "Kill port conflicts:           ./kill-port-conflicts.sh"

echo ""
if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}🎉 All services are healthy and running properly!${NC}"
    echo -e "${GREEN}🌐 Frontend available at: http://localhost:3000${NC}"
    echo -e "${GREEN}🚪 Gateway available at: http://localhost:8088${NC}"
else
    echo -e "${RED}❌ Some services are not healthy. Check the details above.${NC}"
    echo ""
    echo -e "${YELLOW}💡 Troubleshooting steps:${NC}"
    echo "1. Check container logs: docker logs [container_name]"
    echo "2. Verify port conflicts: ./docker-port-check.sh"
    echo "3. Restart problematic services: docker-compose -f ../build-docker-compose.yml restart [service_name]"
    echo "4. If Kafka is down, restart it first as other services depend on it"
fi

echo ""
echo "✨ Health check completed!"