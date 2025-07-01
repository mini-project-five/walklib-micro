#!/bin/bash

# WalkLib Micro - 로컬 개발 실행 스크립트
echo "☕ Starting all services locally..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Java 환경 설정
export JAVA_HOME=/workspace/.vscode-remote/data/User/globalStorage/pleiades.java-extension-pack-jdk/java/21

# Java 버전 확인
if ! java -version &> /dev/null; then
    echo -e "${RED}❌ Java가 설치되어 있지 않거나 JAVA_HOME이 설정되지 않았습니다${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Java 환경: $(java -version 2>&1 | head -n 1)${NC}"

# 기존 프로세스 정리
echo -e "${YELLOW}🧹 기존 Java 프로세스 정리 중...${NC}"
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "java.*miniproject" 2>/dev/null || true
sleep 2

# 서비스 목록 (시작 순서 중요)
services=("gateway" "user_management" "author_management" "book_management" "content_writing_management" "point_management" "subscription_management" "ai_system_management")

# 서비스별 포트 정의 (gateway가 수정된 포트 구성에 맞춤)
declare -A SERVICE_PORTS=(
    ["gateway"]="8088"
    ["user_management"]="8082"
    ["author_management"]="8086"
    ["book_management"]="8085"
    ["content_writing_management"]="8087"
    ["point_management"]="8083"
    ["subscription_management"]="8084"
    ["ai_system_management"]="8089"
)

echo -e "${BLUE}🚀 로컬 마이크로서비스 시작 중...${NC}"

# 백그라운드 프로세스 PID 저장용
declare -a PIDS=()

# 서비스 시작
for service in "${services[@]}"; do
    port="${SERVICE_PORTS[$service]}"
    
    if [[ ! -d "$service" ]]; then
        echo -e "${RED}❌ 서비스 디렉토리를 찾을 수 없습니다: $service${NC}"
        continue
    fi
    
    if [[ ! -f "$service/pom.xml" ]]; then
        echo -e "${YELLOW}⚠️  $service/pom.xml을 찾을 수 없습니다. 건너뜁니다.${NC}"
        continue
    fi
    
    echo -e "${YELLOW}Starting $service on port $port...${NC}"
    
    # 로그 디렉토리 생성
    mkdir -p logs
    
    # 백그라운드에서 서비스 시작
    cd "$service"
    mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=$port -Dspring.profiles.active=default" > "../logs/$service.log" 2>&1 &
    PID=$!
    PIDS+=($PID)
    cd ..
    
    echo -e "${GREEN}✅ $service started (PID: $PID)${NC}"
    sleep 3
done

# 잠시 대기하여 서비스들이 안정적으로 시작되도록 함
echo -e "${YELLOW}⏳ 서비스들이 초기화되는 중... (10초 대기)${NC}"
sleep 10

# Frontend 시작 (있는 경우)
if [[ -d "frontend" && -f "frontend/package.json" ]]; then
    echo -e "${YELLOW}🎨 Starting frontend...${NC}"
    cd frontend
    npm start > "../logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    PIDS+=($FRONTEND_PID)
    cd ..
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 모든 서비스가 로컬에서 시작되었습니다!${NC}"
echo ""
echo -e "${BLUE}📋 서비스 접속 정보:${NC}"
for service in "${services[@]}"; do
    port="${SERVICE_PORTS[$service]}"
    echo -e "${BLUE}$service: http://localhost:$port${NC}"
done

if [[ -d "frontend" ]]; then
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
fi

echo ""
echo -e "${BLUE}📝 실시간 로그 확인:${NC}"
echo -e "${YELLOW}tail -f logs/<service_name>.log${NC}"
echo ""
echo -e "${BLUE}📊 실행 중인 프로세스 확인:${NC}"
echo -e "${YELLOW}ps aux | grep java${NC}"
echo ""
echo -e "${BLUE}🛑 모든 서비스 중지:${NC}"
echo -e "${YELLOW}./stop-local.sh${NC}"
echo -e "${YELLOW}또는 Ctrl+C 후 kill 명령 사용${NC}"

# PID 파일에 저장 (종료 시 사용)
echo "${PIDS[*]}" > .local_pids

echo ""
echo -e "${YELLOW}⏳ 서비스들이 시작되는 중입니다... (약 30초 소요)${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# 신호 처리기 설정
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 서비스 종료 중...${NC}"
    
    # 저장된 PID로 프로세스 종료
    if [[ -f .local_pids ]]; then
        SAVED_PIDS=$(cat .local_pids)
        for pid in $SAVED_PIDS; do
            if kill -0 $pid 2>/dev/null; then
                kill $pid 2>/dev/null || true
            fi
        done
        rm -f .local_pids
    fi
    
    # 추가로 Spring Boot 프로세스 정리
    pkill -f "spring-boot:run" 2>/dev/null || true
    pkill -f "java.*miniproject" 2>/dev/null || true
    
    echo -e "${GREEN}✅ 모든 서비스가 종료되었습니다${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 무한 대기 (사용자가 Ctrl+C로 종료할 때까지)
while true; do
    sleep 1
done