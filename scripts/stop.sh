#!/bin/bash

# WalkLib Micro - Docker 컨테이너 중지 스크립트
echo "🛑 Stopping and removing all Docker containers..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 실행 중인 모든 컨테이너 ID 가져오기
ALL_CONTAINERS=$(docker ps -aq)

if [[ -z "$ALL_CONTAINERS" ]]; then
    echo -e "${YELLOW}⚠️ No running containers to stop.${NC}"
else
    echo -e "${BLUE}🔍 Stopping all running containers...${NC}"
    docker stop $(docker ps -q)
    
    echo -e "${BLUE}🗑️ Removing all containers...${NC}"
    docker rm $(docker ps -aq)
    
    echo -e "${GREEN}✅ All containers have been stopped and removed.${NC}"
fi

# Docker 네트워크 정리 (선택 사항)
DANGLING_NETWORKS=$(docker network ls -q --filter "dangling=true")
if [[ -n "$DANGLING_NETWORKS" ]]; then
    echo -e "\n${BLUE}🧹 Pruning dangling Docker networks...${NC}"
    docker network prune -f
    echo -e "${GREEN}✅ Dangling networks have been pruned.${NC}"
fi

echo -e "\n${GREEN}🎉 All clean! Docker environment is now fresh.${NC}"
