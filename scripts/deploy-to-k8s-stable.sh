#!/bin/bash

# WalkLib Micro - Kubernetes 완전 자동화 배포 스크립트 (문제 해결 완료 버전)
echo "🚀 Starting WalkLib Micro Services Deployment to Kubernetes (Stable Version)"
echo "============================================================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 필수 조건 확인
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl이 설치되어 있지 않습니다${NC}"
        exit 1
    fi
    
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
    
    SERVICES=(
        "walklib-user" "walklib-book" "walklib-author" "walklib-point" 
        "walklib-subscription" "walklib-writing" "walklib-aisystem" 
        "walklib-gateway" "walklib-frontend" "zookeeper" "kafka"
    )
    
    for service in "\${SERVICES[@]}"; do
        kubectl delete deployment "\$service" --ignore-not-found=true 2>/dev/null
        kubectl delete service "\$service" --ignore-not-found=true 2>/dev/null
    done
    
    kubectl delete configmap gateway-config --ignore-not-found=true 2>/dev/null
    kubectl delete configmap frontend-nginx-config --ignore-not-found=true 2>/dev/null
    
    echo -e "${GREEN}✅ 기존 리소스 정리 완료${NC}"
    sleep 3
}

# ConfigMap 생성
create_configmaps() {
    echo ""
    echo -e "${BLUE}📋 ConfigMap 생성 중...${NC}"
    
    # Gateway용 Kubernetes 호환 application.yml 생성
    cat > /tmp/application-k8s.yml << 'EOF'
---
# Default profile for local development
spring:
  profiles: default
  application:
    name: gateway
  cloud:
    gateway:
      routes:
        - id: user_management
          uri: http://localhost:8082
          predicates:
            - Path=/users/**
        - id: point_management
          uri: http://localhost:8083
          predicates:
            - Path=/points/**, /pointLists/**
        - id: subscription_management
          uri: http://localhost:8084
          predicates:
            - Path=/subscriptions/**
        - id: book_management
          uri: http://localhost:8085
          predicates:
            - Path=/books/**, /bookLists/**
        - id: author_management
          uri: http://localhost:8086
          predicates:
            - Path=/authors/**, /authorManagements/**, /authorManagementViews/**
        - id: content_writing_management
          uri: http://localhost:8087
          predicates:
            - Path=/manuscripts/**, /manuscriptLists/**
        - id: ai_system_management
          uri: http://localhost:8089
          predicates:
            - Path=/ai/**, /ais/**
        - id: frontend
          uri: http://localhost:3000
          predicates:
            - Path=/**
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
server:
  port: 8088
---
# Docker profile with Kubernetes service names
spring:
  profiles: docker
  application:
    name: gateway
  main:
    allow-bean-definition-overriding: true
  cloud:
    gateway:
      routes:
        - id: user_management
          uri: http://walklib-user:8080
          predicates:
            - Path=/users/**
        - id: point_management
          uri: http://walklib-point:8080
          predicates:
            - Path=/points/**, /pointLists/**
        - id: subscription_management
          uri: http://walklib-subscription:8080
          predicates:
            - Path=/subscriptions/**
        - id: book_management
          uri: http://walklib-book:8080
          predicates:
            - Path=/books/**, /bookLists/**
        - id: author_management
          uri: http://walklib-author:8080
          predicates:
            - Path=/authors/**, /authorManagements/**, /authorManagementViews/**
        - id: content_writing_management
          uri: http://walklib-writing:8080
          predicates:
            - Path=/manuscripts/**, /manuscriptLists/**
        - id: ai_system_management
          uri: http://walklib-aisystem:8080
          predicates:
            - Path=/ai/**, /ais/**
        - id: frontend
          uri: http://walklib-frontend:80
          predicates:
            - Path=/**
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
server:
  port: 8080
EOF

    # Frontend용 Nginx 설정 생성 (수정된 버전)
    cat > /tmp/nginx-frontend.conf << 'EOF'
upstream walklib_gateway {
    server walklib-gateway:8080;
}

server {
    listen 80;
    server_name localhost;
    client_max_body_size 100M;

    # Frontend 정적 파일 서빙
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
    }

    # API 요청은 Gateway로 프록시
    location /api/ {
        proxy_pass http://walklib_gateway/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 100M;
    }

    # 백엔드 서비스 라우팅 (trailing slash 제거)
    location /users {
        proxy_pass http://walklib_gateway/users;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /books {
        proxy_pass http://walklib_gateway/books;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /authors {
        proxy_pass http://walklib_gateway/authors;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /manuscripts {
        proxy_pass http://walklib_gateway/manuscripts;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /ai {
        proxy_pass http://walklib_gateway/ai;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /points {
        proxy_pass http://walklib_gateway/points;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /subscriptions {
        proxy_pass http://walklib_gateway/subscriptions;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # ConfigMap 생성
    kubectl create configmap gateway-config --from-file=application.yml=/tmp/application-k8s.yml
    kubectl create configmap frontend-nginx-config --from-file=default.conf=/tmp/nginx-frontend.conf
    
    echo -e "${GREEN}✅ ConfigMap 생성 완료${NC}"
}

# 인프라 서비스 배포 (Zookeeper, Kafka)
deploy_infrastructure() {
    echo ""
    echo -e "${BLUE}🔧 인프라 서비스 배포 중...${NC}"
    
    # Zookeeper 배포
    echo -e "${YELLOW}📦 Zookeeper 배포 중...${NC}"
    kubectl create deployment zookeeper --image=confluentinc/cp-zookeeper:latest --port=2181
    kubectl set env deployment/zookeeper ZOOKEEPER_CLIENT_PORT=2181 ZOOKEEPER_TICK_TIME=2000
    kubectl expose deployment zookeeper --port=2181 --target-port=2181
    
    echo -e "${GREEN}✅ Zookeeper 배포 완료${NC}"
    
    # Zookeeper 시작 대기
    echo -e "${YELLOW}⏳ Zookeeper 시작 대기 중...${NC}"
    kubectl wait --for=condition=available --timeout=60s deployment/zookeeper
    sleep 10
    
    # Kafka 배포 (안정적인 Bitnami 버전 사용)
    echo -e "${YELLOW}📦 Kafka 배포 중 (Bitnami 안정 버전)...${NC}"
    kubectl create deployment kafka --image=bitnami/kafka:3.4 --port=9092
    
    kubectl set env deployment/kafka \
        KAFKA_CFG_NODE_ID=0 \
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
        ALLOW_PLAINTEXT_LISTENER=yes
    
    kubectl expose deployment kafka --port=9092 --target-port=9092
    
    echo -e "${GREEN}✅ Kafka 배포 완료${NC}"
    
    # Kafka 시작 대기
    echo -e "${YELLOW}⏳ Kafka 시작 대기 중...${NC}"
    kubectl wait --for=condition=available --timeout=120s deployment/kafka
    sleep 15
}

# 마이크로서비스 배포
deploy_microservices() {
    echo ""
    echo -e "${BLUE}🚀 마이크로서비스 배포 중...${NC}"
    
    # 백엔드 서비스들 배포
    BACKEND_SERVICES=(
        "walklib-user:buildingbite/walklib_user:latest"
        "walklib-author:buildingbite/walklib_author:latest"
        "walklib-book:buildingbite/walklib_book:latest"
        "walklib-point:buildingbite/walklib_point:latest"
        "walklib-subscription:buildingbite/walklib_subscription:latest"
        "walklib-writing:buildingbite/walklib_writing:latest"
        "walklib-aisystem:buildingbite/walklib_aisystem:latest"
    )
    
    for service_info in "\${BACKEND_SERVICES[@]}"; do
        IFS=':' read -r service_name image_name image_tag <<< "\$service_info"
        
        echo -e "${YELLOW}📦 \$service_name 배포 중...${NC}"
        
        kubectl create deployment "\$service_name" --image="\$image_name:\$image_tag" --port=8080
        kubectl set env deployment/"\$service_name" SPRING_PROFILES_ACTIVE=docker
        kubectl expose deployment "\$service_name" --port=8080 --target-port=8080
        
        echo -e "${GREEN}✅ \$service_name 배포 완료${NC}"
        sleep 2
    done
    
    # 백엔드 서비스들 시작 대기
    echo -e "${YELLOW}⏳ 백엔드 서비스들 시작 대기 중...${NC}"
    for service_info in "\${BACKEND_SERVICES[@]}"; do
        IFS=':' read -r service_name _ <<< "\$service_info"
        kubectl wait --for=condition=available --timeout=120s deployment/"\$service_name"
    done
    sleep 10
}

# Gateway 배포 (ConfigMap 사용)
deploy_gateway() {
    echo ""
    echo -e "${YELLOW}📦 Gateway 배포 중 (ConfigMap 사용)...${NC}"
    
    cat > /tmp/gateway-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: walklib-gateway
spec:
  replicas: 1
  selector:
    matchLabels:
      app: walklib-gateway
  template:
    metadata:
      labels:
        app: walklib-gateway
    spec:
      containers:
      - name: walklib-gateway
        image: buildingbite/walklib_gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "docker"
        - name: SPRING_CONFIG_LOCATION
          value: "file:/app/config/application.yml"
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
      volumes:
      - name: config-volume
        configMap:
          name: gateway-config
EOF

    kubectl apply -f /tmp/gateway-deployment.yaml
    kubectl expose deployment walklib-gateway --port=8080 --target-port=8080 --type=LoadBalancer
    
    echo -e "${GREEN}✅ Gateway 배포 완료${NC}"
    
    # Gateway 시작 대기
    echo -e "${YELLOW}⏳ Gateway 시작 대기 중...${NC}"
    kubectl wait --for=condition=available --timeout=120s deployment/walklib-gateway
    sleep 10
}

# Frontend 배포 (ConfigMap 사용)
deploy_frontend() {
    echo ""
    echo -e "${YELLOW}📦 Frontend 배포 중 (ConfigMap 사용)...${NC}"
    
    cat > /tmp/frontend-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: walklib-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: walklib-frontend
  template:
    metadata:
      labels:
        app: walklib-frontend
    spec:
      containers:
      - name: walklib-frontend
        image: buildingbite/walklib_frontend:latest
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d/default.conf
          subPath: default.conf
      volumes:
      - name: nginx-config
        configMap:
          name: frontend-nginx-config
EOF

    kubectl apply -f /tmp/frontend-deployment.yaml
    kubectl expose deployment walklib-frontend --port=80 --target-port=80 --type=LoadBalancer
    
    echo -e "${GREEN}✅ Frontend 배포 완료${NC}"
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
    
    # 외부 IP 확인
    GATEWAY_IP=\$(kubectl get service walklib-gateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    FRONTEND_IP=\$(kubectl get service walklib-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [ ! -z "\$GATEWAY_IP" ] && [ "\$GATEWAY_IP" != "null" ]; then
        echo -e "${BLUE}🌐 Gateway URL: http://\$GATEWAY_IP:8080${NC}"
    fi
    
    if [ ! -z "\$FRONTEND_IP" ] && [ "\$FRONTEND_IP" != "null" ]; then
        echo -e "${BLUE}🌐 Frontend URL: http://\$FRONTEND_IP${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📋 유용한 명령어들:${NC}"
    echo -e "${YELLOW}  kubectl get all                    # 모든 리소스 확인${NC}"
    echo -e "${YELLOW}  kubectl get services               # 서비스 상태 확인${NC}"
    echo -e "${YELLOW}  kubectl logs deployment/<name>     # 로그 확인${NC}"
    echo ""
    echo -e "${BLUE}🛑 모든 서비스 삭제:${NC}"
    echo -e "${YELLOW}  \$0 --cleanup${NC}"
}

# 메인 실행 함수
main() {
    check_prerequisites
    cleanup_existing_resources
    create_configmaps
    deploy_infrastructure
    deploy_microservices
    deploy_gateway
    deploy_frontend
    verify_deployment
    show_access_info
    
    echo ""
    echo -e "${GREEN}✨ 완전 자동화 배포가 완료되었습니다!${NC}"
    echo ""
    echo "💡 다음에는 이 스크립트만 실행하면 모든 문제가 자동으로 해결됩니다!"
}

# 스크립트 인수 처리
if [[ "\${BASH_SOURCE[0]}" == "\${0}" ]]; then
    case "\${1:-}" in
        --help|-h)
            echo "WalkLib Micro Kubernetes 완전 자동화 배포 스크립트"
            echo ""
            echo "사용법: \$0 [옵션]"
            echo ""
            echo "옵션:"
            echo "  --help, -h    이 도움말 표시"
            echo "  --cleanup     기존 리소스만 정리"
            echo ""
            echo "특징:"
            echo "  ✅ 모든 문제 해결 방법이 적용된 완전 자동화 버전"
            echo "  ✅ Kubernetes 호환 호스트명 사용"
            echo "  ✅ 안정적인 Bitnami Kafka 사용"
            echo "  ✅ ConfigMap으로 설정 주입"
            echo "  ✅ Frontend Nginx 설정 자동 수정"
            ;;
        --cleanup)
            check_prerequisites
            cleanup_existing_resources
            echo -e "${GREEN}✅ 정리가 완료되었습니다${NC}"
            ;;
        *)
            main "\$@"
            ;;
    esac
fi