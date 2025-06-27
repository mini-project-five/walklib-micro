#!/bin/bash

# WalkLib Micro - 빌드 및 배포 자동화 스크립트
# 사용법: ./build-and-deploy.sh <service_name> [version]

set -e  # 오류 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 서비스별 이미지 맵핑 정의
declare -A SERVICE_IMAGES=(
    ["ai_system_management"]="buildingbite/walklib_aisystem"
    ["author_management"]="buildingbite/walklib_author"
    ["book_management"]="buildingbite/walklib_book"
    ["content_writing_management"]="buildingbite/walklib_writing"
    ["frontend"]="buildingbite/walklib_frontend"
    ["gateway"]="buildingbite/walklib_gateway"
    ["point_management"]="buildingbite/walklib_point"
    ["subscription_management"]="buildingbite/walklib_subscription"
    ["user_management"]="buildingbite/walklib_user"
    ["infra"]="buildingbite/walklib_infra"
)

# 도움말 함수
show_help() {
    echo -e "${BLUE}WalkLib Micro 빌드 및 배포 스크립트${NC}"
    echo ""
    echo "사용법:"
    echo "  ./build-and-deploy.sh <service_name> [version]"
    echo "  ./build-and-deploy.sh all [version]"
    echo ""
    echo "서비스 목록:"
    for service in "${!SERVICE_IMAGES[@]}"; do
        echo "  - ${service}"
    done
    echo ""
    echo "예시:"
    echo "  ./build-and-deploy.sh author_management"
    echo "  ./build-and-deploy.sh author_management v1.0.1"
    echo "  ./build-and-deploy.sh all v1.0.0"
    echo ""
}

# 단일 서비스 빌드 및 배포
build_and_deploy_service() {
    local SERVICE_NAME=$1
    local VERSION=${2:-"v1.0.0"}
    
    # 서비스 유효성 검사
    if [[ ! "${SERVICE_IMAGES[$SERVICE_NAME]}" ]]; then
        echo -e "${RED}❌ 알 수 없는 서비스: $SERVICE_NAME${NC}"
        echo -e "${YELLOW}💡 사용 가능한 서비스 목록을 보려면 --help 옵션을 사용하세요${NC}"
        return 1
    fi
    
    local IMAGE_NAME="${SERVICE_IMAGES[$SERVICE_NAME]}:$VERSION"
    
    echo -e "${BLUE}🚀 $SERVICE_NAME 빌드 및 배포 시작...${NC}"
    echo -e "${BLUE}📦 이미지: $IMAGE_NAME${NC}"
    
    # 서비스 디렉토리 존재 확인
    if [[ ! -d "$SERVICE_NAME" ]]; then
        echo -e "${RED}❌ 서비스 디렉토리를 찾을 수 없습니다: $SERVICE_NAME${NC}"
        return 1
    fi
    
    # Java 서비스인지 확인 (pom.xml 존재 여부)
    if [[ -f "$SERVICE_NAME/pom.xml" ]]; then
        echo -e "${YELLOW}🔨 Maven 빌드 중...${NC}"
        cd "$SERVICE_NAME"
        
        # Java 환경 설정
        export JAVA_HOME=/workspace/.vscode-remote/data/User/globalStorage/pleiades.java-extension-pack-jdk/java/21
        
        if mvn clean package -DskipTests -q; then
            echo -e "${GREEN}✅ Maven 빌드 완료${NC}"
        else
            echo -e "${RED}❌ Maven 빌드 실패${NC}"
            cd ..
            return 1
        fi
        cd ..
    elif [[ "$SERVICE_NAME" == "frontend" ]]; then
        echo -e "${YELLOW}🔨 Frontend 빌드 중...${NC}"
        cd "$SERVICE_NAME"
        if [[ -f "package.json" ]]; then
            if npm run build; then
                echo -e "${GREEN}✅ Frontend 빌드 완료${NC}"
            else
                echo -e "${RED}❌ Frontend 빌드 실패${NC}"
                cd ..
                return 1
            fi
        else
            echo -e "${YELLOW}⚠️  package.json이 없습니다. 빌드 단계를 건너뜁니다.${NC}"
        fi
        cd ..
    fi
    
    # Dockerfile 존재 확인
    if [[ ! -f "$SERVICE_NAME/Dockerfile" ]]; then
        echo -e "${RED}❌ Dockerfile을 찾을 수 없습니다: $SERVICE_NAME/Dockerfile${NC}"
        return 1
    fi
    
    # Docker 이미지 빌드
    echo -e "${YELLOW}🐳 Docker 이미지 빌드 중...${NC}"
    if docker build -t "$IMAGE_NAME" "$SERVICE_NAME"; then
        echo -e "${GREEN}✅ Docker 이미지 빌드 완료${NC}"
    else
        echo -e "${RED}❌ Docker 이미지 빌드 실패${NC}"
        return 1
    fi
    
    # Docker 이미지 푸시
    echo -e "${YELLOW}📤 Docker 이미지 푸시 중...${NC}"
    if docker push "$IMAGE_NAME"; then
        echo -e "${GREEN}✅ Docker 이미지 푸시 완료${NC}"
    else
        echo -e "${RED}❌ Docker 이미지 푸시 실패${NC}"
        return 1
    fi
    
    # Docker Compose 서비스 재시작 (선택사항)
    if [[ -f "infra/docker-compose.yml" ]] && docker-compose -f infra/docker-compose.yml ps "$SERVICE_NAME" &>/dev/null; then
        echo -e "${YELLOW}🔄 Docker Compose 서비스 재시작 중...${NC}"
        if docker-compose -f infra/docker-compose.yml restart "$SERVICE_NAME"; then
            echo -e "${GREEN}✅ 서비스 재시작 완료${NC}"
        else
            echo -e "${YELLOW}⚠️  서비스 재시작 실패 (수동으로 재시작해주세요)${NC}"
        fi
    fi
    
    echo -e "${GREEN}🎉 $SERVICE_NAME 배포 완료! ($IMAGE_NAME)${NC}"
    echo ""
}

# 전체 서비스 빌드 및 배포
build_and_deploy_all() {
    local VERSION=${1:-"v1.0.0"}
    
    echo -e "${BLUE}🚀 모든 서비스 빌드 및 배포 시작... (버전: $VERSION)${NC}"
    echo ""
    
    local SUCCESS_COUNT=0
    local FAIL_COUNT=0
    local FAILED_SERVICES=()
    
    # Java 서비스들 먼저 빌드
    local JAVA_SERVICES=("gateway" "user_management" "author_management" "book_management" "content_writing_management" "point_management" "subscription_management" "ai_system_management")
    
    for service in "${JAVA_SERVICES[@]}"; do
        if build_and_deploy_service "$service" "$VERSION"; then
            ((SUCCESS_COUNT++))
        else
            ((FAIL_COUNT++))
            FAILED_SERVICES+=("$service")
        fi
    done
    
    # Frontend 빌드 (있는 경우)
    if [[ -d "frontend" ]]; then
        if build_and_deploy_service "frontend" "$VERSION"; then
            ((SUCCESS_COUNT++))
        else
            ((FAIL_COUNT++))
            FAILED_SERVICES+=("frontend")
        fi
    fi
    
    # 결과 요약
    echo -e "${BLUE}📊 빌드 및 배포 결과 요약${NC}"
    echo -e "${GREEN}✅ 성공: $SUCCESS_COUNT개 서비스${NC}"
    
    if [[ $FAIL_COUNT -gt 0 ]]; then
        echo -e "${RED}❌ 실패: $FAIL_COUNT개 서비스${NC}"
        echo -e "${RED}실패한 서비스: ${FAILED_SERVICES[*]}${NC}"
        return 1
    else
        echo -e "${GREEN}🎉 모든 서비스 배포 완료!${NC}"
    fi
}

# 메인 로직
main() {
    # 파라미터 확인
    if [[ $# -eq 0 ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
        show_help
        exit 0
    fi
    
    local SERVICE_NAME=$1
    local VERSION=${2:-"v1.0.0"}
    
    # Docker 로그인 확인
    if ! docker info &>/dev/null; then
        echo -e "${RED}❌ Docker가 실행되고 있지 않습니다${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔐 Docker Hub 로그인 상태 확인 중...${NC}"
    if ! docker pull buildingbite/walklib_test:latest &>/dev/null; then
        echo -e "${YELLOW}⚠️  Docker Hub에 로그인되어 있지 않을 수 있습니다${NC}"
        echo -e "${YELLOW}💡 'docker login' 명령으로 로그인하세요${NC}"
    fi
    
    # 전체 빌드 또는 개별 서비스 빌드
    if [[ "$SERVICE_NAME" == "all" ]]; then
        build_and_deploy_all "$VERSION"
    else
        build_and_deploy_service "$SERVICE_NAME" "$VERSION"
    fi
}

# 스크립트 실행
main "$@"