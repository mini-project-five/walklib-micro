#!/bin/bash

# WalkLib Micro - Docker 컨테이너 중지 스크립트
echo "🛑 Stopping all Docker containers..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# WalkLib 관련 컨테이너 찾기
WALKLIB_CONTAINERS=$(docker ps -q --filter name=walklib_)

if [[ -z "$WALKLIB_CONTAINERS" ]]; then
    echo -e "${YELLOW}⚠️  실행 중인 WalkLib 컨테이너가 없습니다${NC}"
else
    echo -e "${BLUE}🔍 실행 중인 WalkLib 컨테이너:${NC}"
    docker ps --filter name=walklib_ --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
    echo ""
    
    # 컨테이너 중지
    echo -e "${YELLOW}🛑 컨테이너 중지 중...${NC}"
    echo "$WALKLIB_CONTAINERS" | xargs docker stop
    
    # 컨테이너 제거
    echo -e "${YELLOW}🗑️  컨테이너 제거 중...${NC}"
    echo "$WALKLIB_CONTAINERS" | xargs docker rm
    
    echo -e "${GREEN}✅ WalkLib 컨테이너가 모두 중지되었습니다${NC}"
fi

# 인프라 서비스 중지 (선택사항)
if [[ -f "infra/docker-compose.yml" ]]; then
    echo ""
    echo -e "${YELLOW}❓ 인프라 서비스도 중지하시겠습니까? (DB, Kafka 등) [y/N]${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔧 인프라 서비스 중지 중...${NC}"
        cd infra
        docker-compose down
        cd ..
        echo -e "${GREEN}✅ 인프라 서비스가 중지되었습니다${NC}"
    else
        echo -e "${BLUE}ℹ️  인프라 서비스는 계속 실행됩니다${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📊 남은 실행 중인 컨테이너:${NC}"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

echo ""
echo -e "${GREEN}🎉 작업 완료!${NC}"