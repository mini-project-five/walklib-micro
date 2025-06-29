#!/bin/bash

# WalkLib Micro - 빠른 개발용 배포 스크립트
# 현재 작업 중인 서비스만 빠르게 재배포

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 변경된 서비스 자동 감지
detect_changed_services() {
    echo -e "${BLUE}🔍 변경된 서비스 감지 중...${NC}"
    
    # Git으로 변경된 파일 확인
    local CHANGED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || git status --porcelain | cut -c4-)
    local CHANGED_SERVICES=()
    
    # 각 서비스 디렉토리 확인
    local SERVICES=("ai_system_management" "author_management" "book_management" "content_writing_management" "gateway" "point_management" "subscription_management" "user_management" "frontend")
    
    for service in "${SERVICES[@]}"; do
        if echo "$CHANGED_FILES" | grep -q "^$service/"; then
            CHANGED_SERVICES+=("$service")
        fi
    done
    
    if [[ ${#CHANGED_SERVICES[@]} -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  변경된 서비스를 찾을 수 없습니다${NC}"
        echo -e "${BLUE}💡 수동으로 서비스를 선택하세요:${NC}"
        select_service_interactive
    else
        echo -e "${GREEN}✅ 변경된 서비스: ${CHANGED_SERVICES[*]}${NC}"
        
        # 사용자 확인
        echo -e "${YELLOW}이 서비스들을 배포하시겠습니까? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            for service in "${CHANGED_SERVICES[@]}"; do
                ./build-and-deploy.sh "$service"
            done
        else
            select_service_interactive
        fi
    fi
}

# 대화형 서비스 선택
select_service_interactive() {
    echo -e "${BLUE}📋 사용 가능한 서비스 목록:${NC}"
    
    local SERVICES=("ai_system_management" "author_management" "book_management" "content_writing_management" "gateway" "point_management" "subscription_management" "user_management" "frontend" "모든 서비스")
    
    PS3="배포할 서비스를 선택하세요 (번호 입력): "
    select service in "${SERVICES[@]}"; do
        case $service in
            "모든 서비스")
                echo -e "${BLUE}🚀 모든 서비스 배포 시작...${NC}"
                ./build-and-deploy.sh all
                break
                ;;
            "")
                echo -e "${RED}❌ 잘못된 선택입니다${NC}"
                ;;
            *)
                echo -e "${BLUE}🚀 $service 배포 시작...${NC}"
                ./build-and-deploy.sh "$service"
                break
                ;;
        esac
    done
}

# 개발 모드 (로컬 재시작)
dev_mode() {
    echo -e "${BLUE}🔧 개발 모드: 로컬 서비스 재시작${NC}"
    
    # 기존 로컬 서비스 중지
    echo -e "${YELLOW}🛑 기존 로컬 서비스 중지 중...${NC}"
    ./stop-local.sh
    
    sleep 2
    
    # 로컬 서비스 재시작
    echo -e "${GREEN}🚀 로컬 서비스 재시작 중...${NC}"
    ./run-local.sh
}

# 도움말
show_help() {
    echo -e "${BLUE}WalkLib Micro 빠른 배포 스크립트${NC}"
    echo ""
    echo "사용법:"
    echo "  ./quick-deploy.sh          # 변경된 서비스 자동 감지 및 배포"
    echo "  ./quick-deploy.sh dev      # 로컬 개발 모드 (Docker 없이 재시작)"
    echo "  ./quick-deploy.sh select   # 대화형 서비스 선택"
    echo ""
}

# 메인 로직
main() {
    case "${1:-auto}" in
        "dev")
            dev_mode
            ;;
        "select")
            select_service_interactive
            ;;
        "auto"|"")
            detect_changed_services
            ;;
        "--help"|"-h")
            show_help
            ;;
        *)
            echo -e "${RED}❌ 알 수 없는 옵션: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"