#!/bin/bash

# WalkLib Micro - Docker 컨테이너 실행 스크립트
echo "🐳 Starting all services with Docker..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되어 있지 않습니다${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose가 설치되어 있지 않습니다${NC}"
    exit 1
fi

# Docker 실행 확인
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker 데몬이 실행되고 있지 않습니다${NC}"
    exit 1
fi

# 인프라 서비스 먼저 시작 (DB, Kafka 등)
echo -e "${BLUE}🔧 인프라 서비스 시작 중...${NC}"
if [ -f "infra/docker-compose.yml" ]; then
    cd infra
    docker-compose up -d
    echo -e "${GREEN}✅ 인프라 서비스 시작됨${NC}"
    cd ..
    
    # 인프라 서비스 준비 대기
    echo -e "${YELLOW}⏳ 인프라 서비스 준비 대기 중...${NC}"
    sleep 10
else
    echo -e "${YELLOW}⚠️  infra/docker-compose.yml을 찾을 수 없습니다${NC}"
fi

# 서비스별 이미지 정의
declare -A SERVICE_IMAGES=(
    ["gateway"]="buildingbite/walklib_gateway:v1.0.0"
    ["user_management"]="buildingbite/walklib_user:v1.0.0"
    ["author_management"]="buildingbite/walklib_author:v1.0.0"
    ["book_management"]="buildingbite/walklib_book:v1.0.0"
    ["content_writing_management"]="buildingbite/walklib_writing:v1.0.0"
    ["point_management"]="buildingbite/walklib_point:v1.0.0"
    ["subscription_management"]="buildingbite/walklib_subscription:v1.0.0"
    ["ai_system_management"]="buildingbite/walklib_aisystem:v1.0.0"
    ["frontend"]="buildingbite/walklib_frontend:v1.0.0"
)

# 서비스별 포트 정의
declare -A SERVICE_PORTS=(
    ["gateway"]="8080"
    ["user_management"]="8081"
    ["author_management"]="8082"
    ["book_management"]="8083"
    ["content_writing_management"]="8084"
    ["point_management"]="8085"
    ["subscription_management"]="8086"
    ["ai_system_management"]="8087"
    ["frontend"]="80"
)

# 기존 컨테이너 정리
echo -e "${YELLOW}🧹 기존 컨테이너 정리 중...${NC}"
for service in "${!SERVICE_IMAGES[@]}"; do
    if docker ps -q -f name="walklib_$service" | grep -q .; then
        docker stop "walklib_$service" &> /dev/null || true
        docker rm "walklib_$service" &> /dev/null || true
    fi
done

# 서비스 시작
echo -e "${BLUE}🚀 마이크로서비스 시작 중...${NC}"
for service in "${!SERVICE_IMAGES[@]}"; do
    image="${SERVICE_IMAGES[$service]}"
    port="${SERVICE_PORTS[$service]}"
    
    echo -e "${YELLOW}Starting $service on port $port...${NC}"
    
    # Docker 이미지 풀
    if ! docker pull "$image" &> /dev/null; then
        echo -e "${YELLOW}⚠️  $image 이미지를 풀할 수 없습니다. 로컬 이미지 사용${NC}"
    fi
    
    # 컨테이너 실행 (frontend는 다른 설정 사용)
    if [ "$service" = "frontend" ]; then
        docker run -d \
            --name "walklib_$service" \
            --network="infra_default" \
            --network-alias="frontend" \
            -p "$port:80" \
            "$image"
    else
        docker run -d \
            --name "walklib_$service" \
            --network="infra_default" \
            -p "$port:$port" \
            -e SPRING_PROFILES_ACTIVE=docker \
            "$image"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $service started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start $service${NC}"
    fi
    
    sleep 2
done


echo ""
echo -e "${GREEN}🎉 모든 서비스가 시작되었습니다!${NC}"
echo ""
echo -e "${BLUE}📋 서비스 접속 정보:${NC}"
echo -e "${BLUE}Gateway:     http://localhost:8080${NC}"
echo -e "${BLUE}Frontend:    http://localhost${NC}"
echo ""
echo -e "${BLUE}📊 실행 중인 컨테이너 확인:${NC}"
echo -e "${YELLOW}docker ps --filter name=walklib_${NC}"
echo ""
echo -e "${BLUE}🛑 모든 서비스 중지:${NC}"
echo -e "${YELLOW}./stop.sh${NC}"
echo ""
echo -e "${BLUE}📝 로그 확인:${NC}"
echo -e "${YELLOW}docker logs walklib_<service_name>${NC}"