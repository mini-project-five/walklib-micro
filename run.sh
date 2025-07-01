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

# 서비스별 이미지 정의 (latest 태그 사용)
declare -A SERVICE_IMAGES=(
    ["gateway"]="buildingbite/walklib_gateway:latest"
    ["user_management"]="buildingbite/walklib_user:latest"
    ["author_management"]="buildingbite/walklib_author:latest"
    ["book_management"]="buildingbite/walklib_book:latest"
    ["content_writing_management"]="buildingbite/walklib_writing:latest"
    ["point_management"]="buildingbite/walklib_point:latest"
    ["subscription_management"]="buildingbite/walklib_subscription:latest"
    ["ai_system_management"]="buildingbite/walklib_aisystem:latest"
    ["frontend"]="buildingbite/walklib_frontend:latest"
)

# latest 태그가 없는 경우 fallback 버전
declare -A FALLBACK_VERSIONS=(
    ["gateway"]="v1.0.2"
    ["user_management"]="v1.0.2"
    ["author_management"]="v1.0.2"
    ["book_management"]="v1.0.2"
    ["content_writing_management"]="v1.0.2"
    ["point_management"]="v1.0.2"
    ["subscription_management"]="v1.0.2"
    ["ai_system_management"]="v1.0.2"
    ["frontend"]="v1.0.2"
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

# 서비스 시작 순서 정의 (의존성 고려)
SERVICE_ORDER=(
    "gateway"                      # 1. Gateway 먼저 시작 (다른 서비스들이 참조)
    "user_management"              # 2. Core 서비스들
    "author_management"
    "book_management"
    "point_management"
    "subscription_management"
    "content_writing_management"
    "ai_system_management"
    "frontend"                     # 3. Frontend 마지막 (Gateway 의존)
)

# 서비스 시작
echo -e "${BLUE}🚀 마이크로서비스 시작 중...${NC}"
for service in "${SERVICE_ORDER[@]}"; do
    image="${SERVICE_IMAGES[$service]}"
    port="${SERVICE_PORTS[$service]}"
    
    echo -e "${YELLOW}Starting $service on port $port...${NC}"
    
    # Docker 이미지 풀 (latest 실패시 fallback 버전 사용)
    if ! docker pull "$image" &> /dev/null; then
        # 서비스명에서 실제 이미지명 추출
        case "$service" in
            "user_management") fallback_service="user" ;;
            "author_management") fallback_service="author" ;;
            "book_management") fallback_service="book" ;;
            "content_writing_management") fallback_service="writing" ;;
            "point_management") fallback_service="point" ;;
            "subscription_management") fallback_service="subscription" ;;
            "ai_system_management") fallback_service="aisystem" ;;
            *) fallback_service="$service" ;;
        esac
        fallback_image="buildingbite/walklib_$fallback_service:${FALLBACK_VERSIONS[$service]}"
        echo -e "${YELLOW}⚠️  $image 이미지를 풀할 수 없습니다. $fallback_image 사용${NC}"
        if docker pull "$fallback_image" &> /dev/null; then
            image="$fallback_image"
        else
            echo -e "${YELLOW}⚠️  $fallback_image도 풀할 수 없습니다. 로컬 이미지 사용${NC}"
        fi
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
        
        # Gateway 시작 후 추가 대기 (다른 서비스들이 참조할 수 있도록)
        if [ "$service" = "gateway" ]; then
            echo -e "${YELLOW}⏳ Gateway 준비 대기 중...${NC}"
            sleep 10
        else
            sleep 2
        fi
    else
        echo -e "${RED}❌ Failed to start $service${NC}"
        sleep 2
    fi
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