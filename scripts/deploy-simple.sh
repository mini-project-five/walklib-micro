#!/bin/bash

# WalkLib Micro - 간단한 Kubernetes 배포 스크립트
echo "🚀 WalkLib Micro Services 간단 배포 시작"
echo "======================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    "walklib-frontend:buildingbite/walklib_frontend:v1.1"
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
    fi
    if [ ! -z "$GATEWAY_IP" ]; then
        echo -e "${BLUE}🌐 API Gateway URL: http://$GATEWAY_IP:8080${NC}"
    fi
    echo ""
    echo -e "${YELLOW}💡 유용한 명령어:${NC}"
    echo "  kubectl get all               # 모든 리소스 확인"
    echo "  kubectl logs -f deployment/walklib-frontend  # 로그 확인"
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
        echo "  --cleanup  모든 리소스 삭제"
        echo "  --help     도움말 표시"
        ;;
    *)
        main
        ;;
esac