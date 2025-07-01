#!/bin/bash

# WalkLib Micro - Docker 컨테이너 실행 스크립트 (Enhanced)
echo "🚀 Starting WalkLib Micro Services with Docker"
echo "=============================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 필수 조건 확인
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Docker 확인
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker가 설치되어 있지 않습니다${NC}"
        exit 1
    fi
    
    # Docker Compose 확인
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose가 설치되어 있지 않습니다${NC}"
        exit 1
    fi
    
    # Docker 실행 확인
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker 데몬이 실행되고 있지 않습니다${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 모든 필수 조건이 충족되었습니다${NC}"
}

# 포트 충돌 확인 및 해결
check_port_conflicts() {
    echo ""
    echo "🔍 포트 충돌 확인 중..."
    
    # 프로젝트에서 사용하는 포트들
    REQUIRED_PORTS=(8080 8081 8082 8083 8084 8085 8086 8087 80 2181 9092)
    CONFLICTS_FOUND=false
    
    for port in "${REQUIRED_PORTS[@]}"; do
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  포트 $port 이 사용 중입니다${NC}"
            CONFLICTS_FOUND=true
        fi
    done
    
    if [ "$CONFLICTS_FOUND" = true ]; then
        echo ""
        echo -e "${YELLOW}포트 충돌이 감지되었습니다. 옵션을 선택하세요:${NC}"
        echo "1. 자동으로 충돌 프로세스 종료 (권장)"
        echo "2. 수동 해결 (./kill-port-conflicts.sh 사용)"
        echo "3. 그대로 계속 진행 (실패 가능성 있음)"
        echo "4. 종료"
        
        read -p "옵션 선택 (1-4): " choice
        case $choice in
            1)
                echo "🔧 포트 충돌을 자동으로 해결 중..."
                for port in "${REQUIRED_PORTS[@]}"; do
                    process=$(lsof -ti:$port 2>/dev/null)
                    if [ ! -z "$process" ]; then
                        if kill -9 $process 2>/dev/null; then
                            echo -e "${GREEN}✅ 포트 $port 의 프로세스를 종료했습니다${NC}"
                        fi
                    fi
                done
                ;;
            2)
                echo "다음 명령을 실행하세요: ./kill-port-conflicts.sh"
                exit 1
                ;;
            3)
                echo -e "${YELLOW}⚠️  포트 충돌을 무시하고 계속 진행합니다...${NC}"
                ;;
            4)
                echo "종료합니다..."
                exit 0
                ;;
            *)
                echo -e "${RED}잘못된 선택입니다. 종료합니다...${NC}"
                exit 1
                ;;
        esac
    else
        echo -e "${GREEN}✅ 포트 충돌이 없습니다${NC}"
    fi
}

# 인프라 서비스 시작
start_infrastructure() {
    echo ""
    echo -e "${BLUE}🔧 인프라 서비스 시작 중...${NC}"
    if [ -f "../infra/docker-compose.yml" ]; then
        cd ../infra
        docker-compose up -d
        echo -e "${GREEN}✅ 인프라 서비스 시작됨${NC}"
        cd ../scripts
    elif [ -f "./infra/docker-compose.yml" ]; then
        cd ./infra  
        docker-compose up -d
        echo -e "${GREEN}✅ 인프라 서비스 시작됨${NC}"
        cd ../scripts
    elif [ -f "/workspace/walklib-micro/infra/docker-compose.yml" ]; then
        cd /workspace/walklib-micro/infra
        docker-compose up -d
        echo -e "${GREEN}✅ 인프라 서비스 시작됨${NC}"
        cd /workspace/walklib-micro/scripts
        
        # 인프라 서비스 준비 대기
        echo -e "${YELLOW}⏳ 인프라 서비스 준비 대기 중...${NC}"
        sleep 10
    else
        echo -e "${YELLOW}⚠️  ../infra/docker-compose.yml을 찾을 수 없습니다${NC}"
    fi
}

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
    ["gateway"]="v1.1.1"
    ["user_management"]="v1.1.1"
    ["author_management"]="v1.1.1"
    ["book_management"]="v1.1.1"
    ["content_writing_management"]="v1.1.1"
    ["point_management"]="v1.1.1"
    ["subscription_management"]="v1.1.1"
    ["ai_system_management"]="v1.1.1"
    ["frontend"]="v1.1.1"
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
cleanup_existing_containers() {
    echo -e "${YELLOW}🧹 기존 컨테이너 정리 중...${NC}"
    for service in "${!SERVICE_IMAGES[@]}"; do
        # 실행 중인 컨테이너 중지
        if docker ps -q -f name="walklib_$service" | grep -q .; then
            echo -e "${YELLOW}  🛑 walklib_$service 중지 중...${NC}"
            docker stop "walklib_$service" &> /dev/null || true
        fi
        # 모든 컨테이너 (중지된 것도 포함) 제거
        if docker ps -aq -f name="walklib_$service" | grep -q .; then
            echo -e "${YELLOW}  🗑️  walklib_$service 제거 중...${NC}"
            docker rm "walklib_$service" &> /dev/null || true
        fi
    done
}

# 마이크로서비스 시작
start_microservices() {
    echo -e "${BLUE}🚀 마이크로서비스 시작 중...${NC}"
    
    # 서비스 시작 순서 정의 (의존성 고려)
    SERVICE_ORDER=(
        "user_management"              # 1. Core 서비스들 먼저 시작
        "author_management"
        "book_management"
        "point_management"
        "subscription_management"
        "content_writing_management"
        "ai_system_management"
        "gateway"                      # 2. Gateway는 백엔드 서비스들 이후 시작
        "frontend"                     # 3. Frontend 마지막 (Gateway 의존)
    )
    
    for service in "${SERVICE_ORDER[@]}"; do
        image="${SERVICE_IMAGES[$service]}"
        port="${SERVICE_PORTS[$service]}"
        
        echo -e "${YELLOW}📦 $service 시작 중 (포트: $port)...${NC}"
        
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
        
        # 네트워크 확인 및 생성
        if ! docker network ls | grep -q "infra_default"; then
            echo -e "${YELLOW}⚠️  infra_default 네트워크가 없습니다. 생성 중...${NC}"
            docker network create infra_default 2>/dev/null || true
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
            # 모든 마이크로서비스는 컨테이너 내부에서 8080 포트 사용
            docker run -d \
                --name "walklib_$service" \
                --network="infra_default" \
                -p "$port:8080" \
                -e SPRING_PROFILES_ACTIVE=docker \
                "$image"
        fi
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ $service 시작 성공${NC}"
            
            # Gateway 시작 후 추가 대기 (다른 서비스들이 참조할 수 있도록)
            if [ "$service" = "gateway" ]; then
                echo -e "${YELLOW}⏳ Gateway 준비 대기 중...${NC}"
                sleep 10
            else
                sleep 2
            fi
        else
            echo -e "${RED}❌ $service 시작 실패${NC}"
            sleep 2
        fi
    done
}

# 서비스 상태 확인
verify_services() {
    echo ""
    echo "🔍 서비스 상태 확인 중..."
    sleep 5
    
    # 헬스체크 스크립트 실행
    if [ -f "./docker-health-check.sh" ]; then
        echo "📋 헬스체크 실행 중..."
        ./docker-health-check.sh
    else
        echo "📊 실행 중인 컨테이너:"
        docker ps --filter name=walklib_ --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
    fi
}

# 접속 정보 표시
show_access_info() {
    echo ""
    echo -e "${GREEN}🎉 모든 서비스가 시작되었습니다!${NC}"
    echo ""
    echo -e "${BLUE}📋 서비스 접속 정보:${NC}"
    echo -e "${BLUE}  Gateway:     http://localhost:8080${NC}"
    echo -e "${BLUE}  Frontend:    http://localhost${NC}"
    echo ""
    echo -e "${BLUE}📊 실행 중인 컨테이너 확인:${NC}"
    echo -e "${YELLOW}  docker ps --filter name=walklib_${NC}"
    echo ""
    echo -e "${BLUE}🛑 모든 서비스 중지:${NC}"
    echo -e "${YELLOW}  ./stop.sh${NC}"
    echo ""
    echo -e "${BLUE}📝 로그 확인:${NC}"
    echo -e "${YELLOW}  docker logs walklib_<service_name>${NC}"
    echo ""
    echo -e "${BLUE}🩺 헬스체크:${NC}"
    echo -e "${YELLOW}  ./docker-health-check.sh${NC}"
}

# 메인 실행 함수
main() {
    check_prerequisites
    check_port_conflicts
    start_infrastructure
    cleanup_existing_containers
    start_microservices
    verify_services
    show_access_info
    
    echo ""
    echo -e "${GREEN}✨ WalkLib 시작이 완료되었습니다!${NC}"
    echo ""
    echo "💡 팁: 이 터미널을 열어두고 시작 과정을 모니터링하세요"
    echo "    언제든지 './docker-health-check.sh'를 실행하여 상태를 확인할 수 있습니다"
}

# 스크립트 인수 처리
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        --help|-h)
            echo "WalkLib Micro 서비스 시작 스크립트"
            echo ""
            echo "사용법: $0 [옵션]"
            echo ""
            echo "옵션:"
            echo "  --help, -h    이 도움말 표시"
            echo ""
            echo "기능:"
            echo "  ✅ 포트 충돌 자동 감지 및 해결"
            echo "  ✅ 인프라 서비스 자동 시작 (Kafka, Zookeeper)"
            echo "  ✅ 마이크로서비스 순차 시작"
            echo "  ✅ 자동 헬스체크"
            echo "  ✅ 서비스 접속 정보 제공"
            ;;
        *)
            main "$@"
            ;;
    esac
fi