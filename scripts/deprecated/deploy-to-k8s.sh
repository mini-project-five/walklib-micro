#!/bin/bash

# WalkLib Micro - Kubernetes 배포 자동화 스크립트
echo "🚀 Starting WalkLib Micro Services Deployment to Kubernetes"
echo "============================================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 필수 조건 확인
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # kubectl 확인
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl이 설치되어 있지 않습니다${NC}"
        exit 1
    fi
    
    # Kubernetes 클러스터 연결 확인
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}❌ Kubernetes 클러스터에 연결할 수 없습니다${NC}"
        echo "다음 명령을 실행하세요:"
        echo "  az aks get-credentials --resource-group <resource-group> --name <cluster-name>"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 모든 필수 조건이 충족되었습니다${NC}"
}

# 기존 리소스 정리
cleanup_existing_resources() {
    echo ""
    echo -e "${YELLOW}🧹 기존 리소스 정리 중...${NC}"
    
    # WalkLib 관련 모든 리소스 삭제
    kubectl delete deployments,services -l app.kubernetes.io/part-of=walklib --ignore-not-found=true
    
    # 개별 서비스들도 정리 (라벨이 없는 경우를 위해)
    SERVICES=(
        "walklib-user" "walklib-book" "walklib-author" "walklib-point" 
        "walklib-subscription" "walklib-writing" "walklib-aisystem" 
        "walklib-gateway" "walklib-frontend" "zookeeper" "kafka"
    )
    
    for service in "${SERVICES[@]}"; do
        kubectl delete deployment "$service" --ignore-not-found=true 2>/dev/null
        kubectl delete service "$service" --ignore-not-found=true 2>/dev/null
    done
    
    echo -e "${GREEN}✅ 기존 리소스 정리 완료${NC}"
    sleep 3
}

# 인프라 서비스 배포 (Zookeeper, Kafka)
deploy_infrastructure() {
    echo ""
    echo -e "${BLUE}🔧 인프라 서비스 배포 중...${NC}"
    
    # Zookeeper 배포
    echo -e "${YELLOW}📦 Zookeeper 배포 중...${NC}"
    kubectl create deployment zookeeper \
        --image=confluentinc/cp-zookeeper:latest \
        --port=2181
    
    # Zookeeper 환경변수 설정
    kubectl set env deployment/zookeeper \
        ZOOKEEPER_CLIENT_PORT=2181 \
        ZOOKEEPER_TICK_TIME=2000
    
    # Zookeeper 서비스 노출
    kubectl expose deployment zookeeper \
        --port=2181 \
        --target-port=2181
    
    echo -e "${GREEN}✅ Zookeeper 배포 완료${NC}"
    
    # Zookeeper가 시작될 때까지 대기
    echo -e "${YELLOW}⏳ Zookeeper 시작 대기 중...${NC}"
    kubectl wait --for=condition=available --timeout=60s deployment/zookeeper
    sleep 10
    
    # Kafka 배포
    echo -e "${YELLOW}📦 Kafka 배포 중...${NC}"
    kubectl create deployment kafka \
        --image=confluentinc/cp-kafka:latest \
        --port=9092
    
    # Kafka 환경변수 설정
    kubectl set env deployment/kafka \
        KAFKA_BROKER_ID=1 \
        KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
        KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092,PLAINTEXT_HOST://kafka:9092 \
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT \
        KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT \
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1
    
    # Kafka 서비스 노출
    kubectl expose deployment kafka \
        --port=9092 \
        --target-port=9092
    
    echo -e "${GREEN}✅ Kafka 배포 완료${NC}"
    
    # Kafka가 시작될 때까지 대기
    echo -e "${YELLOW}⏳ Kafka 시작 대기 중...${NC}"
    kubectl wait --for=condition=available --timeout=120s deployment/kafka
    sleep 15
}

# 마이크로서비스 배포
deploy_microservices() {
    echo ""
    echo -e "${BLUE}🚀 마이크로서비스 배포 중...${NC}"
    
    # 서비스 정의 (이미지명과 포트)
    declare -A SERVICES=(
        ["walklib-user"]="buildingbite/walklib_user:latest:8080"
        ["walklib-author"]="buildingbite/walklib_author:latest:8080"
        ["walklib-book"]="buildingbite/walklib_book:latest:8080"
        ["walklib-point"]="buildingbite/walklib_point:latest:8080"
        ["walklib-subscription"]="buildingbite/walklib_subscription:latest:8080"
        ["walklib-writing"]="buildingbite/walklib_writing:latest:8080"
        ["walklib-aisystem"]="buildingbite/walklib_aisystem:latest:8080"
        ["walklib-gateway"]="buildingbite/walklib_gateway:latest:8080"
        ["walklib-frontend"]="buildingbite/walklib_frontend:latest:80"
    )
    
    # 백엔드 서비스들 먼저 배포
    BACKEND_SERVICES=(
        "walklib-user" "walklib-author" "walklib-book" "walklib-point"
        "walklib-subscription" "walklib-writing" "walklib-aisystem"
    )
    
    for service in "${BACKEND_SERVICES[@]}"; do
        IFS=':' read -r image port <<< "${SERVICES[$service]}"
        
        echo -e "${YELLOW}📦 $service 배포 중...${NC}"
        
        # Deployment 생성
        kubectl create deployment "$service" \
            --image="$image" \
            --port="$port"
        
        # 환경변수 설정 (Spring Boot 서비스들)
        if [[ "$service" != "walklib-frontend" ]]; then
            kubectl set env deployment/"$service" \
                SPRING_PROFILES_ACTIVE=docker
        fi
        
        # 서비스 노출 (ClusterIP)
        kubectl expose deployment "$service" \
            --port="$port" \
            --target-port="$port"
        
        echo -e "${GREEN}✅ $service 배포 완료${NC}"
        sleep 2
    done
    
    # 백엔드 서비스들이 시작될 때까지 대기
    echo -e "${YELLOW}⏳ 백엔드 서비스들 시작 대기 중...${NC}"
    for service in "${BACKEND_SERVICES[@]}"; do
        kubectl wait --for=condition=available --timeout=120s deployment/"$service"
    done
    sleep 10
    
    # Gateway 배포
    echo -e "${YELLOW}📦 walklib-gateway 배포 중...${NC}"
    IFS=':' read -r image port <<< "${SERVICES[walklib-gateway]}"
    
    kubectl create deployment walklib-gateway \
        --image="$image" \
        --port="$port"
    
    kubectl set env deployment/walklib-gateway \
        SPRING_PROFILES_ACTIVE=docker
    
    # Gateway는 LoadBalancer로 외부 노출
    kubectl expose deployment walklib-gateway \
        --port="$port" \
        --target-port="$port" \
        --type=LoadBalancer
    
    echo -e "${GREEN}✅ walklib-gateway 배포 완료${NC}"
    
    # Gateway 시작 대기
    echo -e "${YELLOW}⏳ Gateway 시작 대기 중...${NC}"
    kubectl wait --for=condition=available --timeout=120s deployment/walklib-gateway
    sleep 10
    
    # Frontend 배포
    echo -e "${YELLOW}📦 walklib-frontend 배포 중...${NC}"
    IFS=':' read -r image port <<< "${SERVICES[walklib-frontend]}"
    
    kubectl create deployment walklib-frontend \
        --image="$image" \
        --port="$port"
    
    # Frontend도 LoadBalancer로 외부 노출
    kubectl expose deployment walklib-frontend \
        --port=80 \
        --target-port=80 \
        --type=LoadBalancer
    
    echo -e "${GREEN}✅ walklib-frontend 배포 완료${NC}"
}

# 배포 상태 확인
verify_deployment() {
    echo ""
    echo -e "${BLUE}🔍 배포 상태 확인 중...${NC}"
    
    echo "📊 모든 리소스:"
    kubectl get all -o wide
    
    echo ""
    echo "🌐 외부 접근 가능한 서비스들:"
    kubectl get services --field-selector spec.type=LoadBalancer
    
    echo ""
    echo -e "${YELLOW}⏳ LoadBalancer IP 할당 대기 중...${NC}"
    echo "외부 IP가 할당될 때까지 기다리세요 (수 분 소요될 수 있음)"
}

# 접속 정보 표시
show_access_info() {
    echo ""
    echo -e "${GREEN}🎉 WalkLib 마이크로서비스가 Kubernetes에 배포되었습니다!${NC}"
    echo ""
    echo -e "${BLUE}📋 유용한 명령어들:${NC}"
    echo -e "${YELLOW}  kubectl get all                    # 모든 리소스 확인${NC}"
    echo -e "${YELLOW}  kubectl get services               # 서비스 상태 확인${NC}"
    echo -e "${YELLOW}  kubectl logs deployment/<name>     # 로그 확인${NC}"
    echo -e "${YELLOW}  kubectl describe pod <pod-name>    # Pod 상세 정보${NC}"
    echo -e "${YELLOW}  kubectl delete deployment <name>   # 특정 서비스 삭제${NC}"
    echo ""
    echo -e "${BLUE}🛑 모든 서비스 삭제:${NC}"
    echo -e "${YELLOW}  kubectl delete deployments,services -l app.kubernetes.io/part-of=walklib${NC}"
    echo ""
    echo -e "${BLUE}📈 실시간 모니터링:${NC}"
    echo -e "${YELLOW}  watch kubectl get pods             # Pod 상태 실시간 확인${NC}"
}

# 메인 실행 함수
main() {
    check_prerequisites
    cleanup_existing_resources
    deploy_infrastructure
    deploy_microservices
    verify_deployment
    show_access_info
    
    echo ""
    echo -e "${GREEN}✨ Kubernetes 배포가 완료되었습니다!${NC}"
    echo ""
    echo "💡 팁: 'kubectl get services' 명령으로 LoadBalancer IP를 확인하세요"
}

# 스크립트 인수 처리
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        --help|-h)
            echo "WalkLib Micro Kubernetes 배포 스크립트"
            echo ""
            echo "사용법: $0 [옵션]"
            echo ""
            echo "옵션:"
            echo "  --help, -h    이 도움말 표시"
            echo "  --cleanup     기존 리소스만 정리"
            echo ""
            echo "기능:"
            echo "  ✅ 기존 리소스 자동 정리"
            echo "  ✅ Zookeeper, Kafka 인프라 배포"
            echo "  ✅ 모든 마이크로서비스 순차 배포"
            echo "  ✅ LoadBalancer로 외부 접근 설정"
            echo "  ✅ 배포 상태 자동 확인"
            ;;
        --cleanup)
            check_prerequisites
            cleanup_existing_resources
            echo -e "${GREEN}✅ 정리가 완료되었습니다${NC}"
            ;;
        *)
            main "$@"
            ;;
    esac
fi