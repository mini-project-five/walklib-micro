#!/bin/bash

# WalkLib Micro - 로컬 서비스 중지 스크립트
echo "🛑 Stopping all local services..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 저장된 PID로 프로세스 종료
if [[ -f .local_pids ]]; then
    echo -e "${BLUE}📋 저장된 PID로 서비스 종료 중...${NC}"
    SAVED_PIDS=$(cat .local_pids)
    for pid in $SAVED_PIDS; do
        if kill -0 $pid 2>/dev/null; then
            PROCESS_NAME=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            echo -e "${YELLOW}Stopping PID $pid ($PROCESS_NAME)...${NC}"
            kill $pid 2>/dev/null || true
        else
            echo -e "${BLUE}PID $pid already stopped${NC}"
        fi
    done
    rm -f .local_pids
    echo -e "${GREEN}✅ 저장된 프로세스 종료 완료${NC}"
else
    echo -e "${YELLOW}⚠️  .local_pids 파일을 찾을 수 없습니다${NC}"
fi

# 추가로 Spring Boot 관련 프로세스 정리
echo -e "${BLUE}🔍 Spring Boot 프로세스 정리 중...${NC}"

# Spring Boot 프로세스 찾기
SPRING_PIDS=$(pgrep -f "spring-boot:run" 2>/dev/null || true)
JAVA_PIDS=$(pgrep -f "java.*miniproject" 2>/dev/null || true)

if [[ -n "$SPRING_PIDS" ]]; then
    echo -e "${YELLOW}Spring Boot 프로세스 종료: $SPRING_PIDS${NC}"
    echo "$SPRING_PIDS" | xargs kill 2>/dev/null || true
fi

if [[ -n "$JAVA_PIDS" ]]; then
    echo -e "${YELLOW}Java 프로세스 종료: $JAVA_PIDS${NC}"
    echo "$JAVA_PIDS" | xargs kill 2>/dev/null || true
fi

# Frontend 프로세스 정리
FRONTEND_PIDS=$(pgrep -f "npm.*start\|node.*serve" 2>/dev/null || true)
if [[ -n "$FRONTEND_PIDS" ]]; then
    echo -e "${YELLOW}Frontend 프로세스 종료: $FRONTEND_PIDS${NC}"
    echo "$FRONTEND_PIDS" | xargs kill 2>/dev/null || true
fi

# 포트 사용 확인
echo ""
echo -e "${BLUE}📊 포트 사용 현황 확인:${NC}"
PORTS=(8080 8081 8082 8083 8084 8085 8086 8087 3000)

for port in "${PORTS[@]}"; do
    PID=$(lsof -ti :$port 2>/dev/null || true)
    if [[ -n "$PID" ]]; then
        echo -e "${RED}❌ Port $port is still in use by PID $PID${NC}"
        echo -e "${YELLOW}   강제 종료하려면: kill -9 $PID${NC}"
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
done

# 로그 파일 정리 여부 확인
if [[ -d "logs" ]] && [[ $(ls -A logs 2>/dev/null | wc -l) -gt 0 ]]; then
    echo ""
    echo -e "${YELLOW}❓ 로그 파일을 정리하시겠습니까? [y/N]${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf logs/*
        echo -e "${GREEN}✅ 로그 파일이 정리되었습니다${NC}"
    else
        echo -e "${BLUE}ℹ️  로그 파일은 보존됩니다 (logs/ 디렉토리)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 로컬 서비스 중지 완료!${NC}"

# 실행 중인 Java 프로세스가 있는지 최종 확인
REMAINING_JAVA=$(pgrep -f "java.*miniproject" 2>/dev/null || true)
if [[ -n "$REMAINING_JAVA" ]]; then
    echo -e "${YELLOW}⚠️  일부 Java 프로세스가 여전히 실행 중입니다:${NC}"
    ps aux | grep java | grep miniproject | grep -v grep
    echo -e "${YELLOW}강제 종료하려면: pkill -9 -f \"java.*miniproject\"${NC}"
else
    echo -e "${GREEN}✅ 모든 Java 프로세스가 정상적으로 종료되었습니다${NC}"
fi