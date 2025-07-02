#!/bin/bash

# WalkLib Micro - 간단한 Kubernetes 배포 스크립트 (AI 서비스 포함)
echo "🚀 WalkLib Micro Services 간단 배포 시작"
echo "======================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# OpenAI API 키 확인
if [ -f ".env" ]; then
    OPENAI_API_KEY=$(grep "OPENAI_API_KEY=" .env | cut -d '=' -f2)
    if [ ! -z "$OPENAI_API_KEY" ]; then
        echo -e "${GREEN}✅ OpenAI API 키를 .env 파일에서 찾았습니다${NC}"
    else
        echo -e "${YELLOW}⚠️  .env 파일에서 OpenAI API 키를 찾을 수 없습니다. AI 기능이 제한됩니다.${NC}"
        OPENAI_API_KEY="sk-dummy-key-for-testing"
    fi
else
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. AI 기능이 제한됩니다.${NC}"
    OPENAI_API_KEY="sk-dummy-key-for-testing"
fi

# 서비스 목록
SERVICES=(
    "zookeeper:confluentinc/cp-zookeeper:latest"
    "kafka:bitnami/kafka:3.4"
    "walklib-user:buildingbite/walklib_user:latest"
    "walklib-author:buildingbite/walklib_author:latest"
    "walklib-book:buildingbite/walklib_book:latest"
    "walklib-point:buildingbite/walklib_point:latest"
    "walklib-subscription:buildingbite/walklib_subscription:latest"
    "walklib-writing:buildingbite/walklib_writing:latest"
    "walklib-aisystem:buildingbite/walklib_aisystem:latest"
    "walklib-gateway:buildingbite/walklib_gateway:latest"
    "walklib-frontend:buildingbite/walklib_frontend:internal-v1"
)

# 기본 함수
deploy_service() {
    local name=$1
    local image=$2
    local port=$3
    local env_vars=$4
    
    echo -e "${YELLOW}📦 $name 배포 중...${NC}"
    
    # Deployment 생성
    kubectl create deployment "$name" --image="$image" --port="$port" 2>/dev/null || \
    kubectl set image deployment/"$name" "$name"="$image"
    
    # 환경 변수 설정
    if [ ! -z "$env_vars" ]; then
        kubectl set env deployment/"$name" $env_vars
    fi
    
    # Service 생성
    if [ "$name" = "walklib-frontend" ] || [ "$name" = "walklib-gateway" ]; then
        kubectl expose deployment "$name" --port="$port" --type=LoadBalancer 2>/dev/null || echo "Service already exists"
    else
        kubectl expose deployment "$name" --port="$port" 2>/dev/null || echo "Service already exists"
    fi
    
    echo -e "${GREEN}✅ $name 배포 완료${NC}"
}

# 메인 배포 프로세스
main() {
    echo -e "${BLUE}🔍 기존 리소스 확인 중...${NC}"
    
    # Zookeeper 배포
    deploy_service "zookeeper" "confluentinc/cp-zookeeper:latest" "2181" \
        "ZOOKEEPER_CLIENT_PORT=2181 ZOOKEEPER_TICK_TIME=2000"
    
    # Kafka 배포
    sleep 10
    deploy_service "kafka" "bitnami/kafka:3.4" "9092" \
        "KAFKA_CFG_NODE_ID=0 \
        KAFKA_CFG_PROCESS_ROLES=controller,broker \
        KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
        KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
        KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@localhost:9093 \
        KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
        KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 \
        KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
        KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
        KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=1 \
        KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true \
        ALLOW_PLAINTEXT_LISTENER=yes"
    
    # 백엔드 서비스들 배포
    sleep 15
    for service in "${SERVICES[@]:2}"; do
        IFS=':' read -r name image <<< "$service"
        if [ "$name" = "walklib-frontend" ]; then
            deploy_service "$name" "$image" "80" ""
        elif [ "$name" = "walklib-aisystem" ]; then
            # AI 서비스에는 OpenAI API 키 추가
            deploy_service "$name" "$image" "8080" "SPRING_PROFILES_ACTIVE=docker OPENAI_API_KEY=$OPENAI_API_KEY"
        else
            deploy_service "$name" "$image" "8080" "SPRING_PROFILES_ACTIVE=docker"
        fi
        sleep 2
    done
    
    echo ""
    echo -e "${GREEN}✨ 배포 완료!${NC}"
    echo ""
    
    # 접속 정보 표시
    echo -e "${BLUE}⏳ LoadBalancer IP 할당 대기 중... (1-2분 소요)${NC}"
    sleep 30
    
    GATEWAY_IP=$(kubectl get service walklib-gateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    FRONTEND_IP=$(kubectl get service walklib-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    echo ""
    echo -e "${GREEN}🎉 WalkLib 서비스 접속 정보${NC}"
    echo "================================"
    if [ ! -z "$FRONTEND_IP" ]; then
        echo -e "${BLUE}🌐 Frontend URL: http://$FRONTEND_IP${NC}"
        echo -e "${BLUE}   → 작가 회원가입/로그인 가능${NC}"
    fi
    if [ ! -z "$GATEWAY_IP" ]; then
        echo -e "${BLUE}🌐 API Gateway URL: http://$GATEWAY_IP:8080${NC}"
        echo -e "${BLUE}   → API 직접 테스트 가능${NC}"
    fi
    echo ""
    echo -e "${GREEN}🤖 AI 서비스 상태:${NC}"
    if [ "$OPENAI_API_KEY" != "sk-dummy-key-for-testing" ]; then
        echo -e "   ✅ OpenAI API 키 설정됨 - AI 기능 사용 가능"
    else
        echo -e "   ⚠️  Dummy API 키 사용 중 - AI 기능 제한됨"
    fi
    echo ""
    echo -e "${YELLOW}💡 유용한 명령어:${NC}"
    echo "  kubectl get all               # 모든 리소스 확인"
    echo "  kubectl get pods              # 파드 상태 확인"
    echo "  kubectl logs deployment/walklib-aisystem  # AI 서비스 로그"
    echo "  ./scripts/status.sh           # 서비스 상태 확인"
    echo "  kubectl delete all --all      # 모든 리소스 삭제"
}

# 정리 함수
cleanup() {
    echo -e "${RED}🧹 모든 리소스 정리 중...${NC}"
    kubectl delete all --all
    echo -e "${GREEN}✅ 정리 완료${NC}"
}

# 스크립트 실행
case "${1:-}" in
    --cleanup)
        cleanup
        ;;
    --help)
        echo "사용법: $0 [옵션]"
        echo ""
        echo "옵션:"
        echo "  --cleanup  모든 리소스 삭제"
        echo "  --help     도움말 표시"
        echo ""
        echo "주요 기능:"
        echo "  ✅ .env 파일에서 OpenAI API 키 자동 읽기"
        echo "  🤖 AI 서비스에 API 키 자동 설정"
        echo "  🚀 모든 서비스 자동 배포"
        echo "  📡 LoadBalancer IP 자동 확인"
        echo ""
        echo "사용 전 준비사항:"
        echo "  1. .env 파일에 OPENAI_API_KEY 설정"
        echo "  2. kubectl이 올바른 클러스터에 연결되어 있는지 확인"
        ;;
    *)
        main
        ;;
esac