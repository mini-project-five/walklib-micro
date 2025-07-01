# WalkLib Micro - Kubernetes 배포 가이드

## 🚀 빠른 시작

### 1. 한 번에 모든 서비스 배포
```bash
kubectl apply -f k8s-deployments/all-in-one.yaml
```

### 2. 접속 정보 확인
```bash
# LoadBalancer IP 확인 (1-2분 소요)
kubectl get svc walklib-frontend walklib-gateway

# 접속 URL
# Frontend: http://<FRONTEND-EXTERNAL-IP>
# API Gateway: http://<GATEWAY-EXTERNAL-IP>:8080
```

## 📦 Docker 이미지

모든 이미지는 ConfigMap 없이 독립적으로 실행 가능합니다:

| 서비스 | Docker 이미지 | 포트 |
|--------|--------------|------|
| Frontend | `buildingbite/walklib_frontend:v1.1` | 80 |
| Gateway | `buildingbite/walklib_gateway:v1.1` | 8080 |
| User | `buildingbite/walklib_user:latest` | 8080 |
| Author | `buildingbite/walklib_author:latest` | 8080 |
| Book | `buildingbite/walklib_book:latest` | 8080 |
| Point | `buildingbite/walklib_point:latest` | 8080 |
| Subscription | `buildingbite/walklib_subscription:latest` | 8080 |
| Writing | `buildingbite/walklib_writing:latest` | 8080 |
| AI System | `buildingbite/walklib_aisystem:latest` | 8080 |
| Kafka | `bitnami/kafka:3.4` | 9092 |
| Zookeeper | `confluentinc/cp-zookeeper:latest` | 2181 |

## 🛠️ 개별 서비스 배포

### Frontend 배포
```bash
kubectl create deployment walklib-frontend --image=buildingbite/walklib_frontend:v1.1
kubectl expose deployment walklib-frontend --port=80 --type=LoadBalancer
```

### Gateway 배포
```bash
kubectl create deployment walklib-gateway --image=buildingbite/walklib_gateway:v1.1
kubectl set env deployment/walklib-gateway SPRING_PROFILES_ACTIVE=docker
kubectl expose deployment walklib-gateway --port=8080 --type=LoadBalancer
```

### 백엔드 서비스 배포 (예: User Service)
```bash
kubectl create deployment walklib-user --image=buildingbite/walklib_user:latest
kubectl set env deployment/walklib-user SPRING_PROFILES_ACTIVE=docker
kubectl expose deployment walklib-user --port=8080
```

## 📝 스크립트 사용

### 간단한 배포 스크립트
```bash
bash scripts/deploy-simple.sh
```

### 정리
```bash
bash scripts/deploy-simple.sh --cleanup
# 또는
kubectl delete -f k8s-deployments/all-in-one.yaml
```

## 🎯 주요 기능

- ✅ **ConfigMap 불필요**: 모든 설정이 이미지에 포함
- ✅ **AI 기능**: DALL-E 표지 생성, GPT 텍스트 다듬기
- ✅ **마이크로서비스 아키텍처**: 독립적인 서비스 배포
- ✅ **이벤트 기반**: Kafka를 통한 비동기 통신

## 🔧 트러블슈팅

### 서비스 상태 확인
```bash
kubectl get all
kubectl logs deployment/<service-name>
```

### 특정 서비스 재시작
```bash
kubectl rollout restart deployment/<service-name>
```

### AI 서비스 로그 확인
```bash
kubectl logs deployment/walklib-aisystem -f
```

## 📊 아키텍처

```
┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Gateway   │
└─────────────┘     └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │  User   │      │  Author   │     │   Book    │
   └─────────┘      └───────────┘     └───────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                      ┌────▼────┐
                      │  Kafka  │
                      └─────────┘
```

## 🚀 업데이트 방법

### 이미지 업데이트
```bash
# 새 버전으로 이미지 업데이트
kubectl set image deployment/walklib-frontend walklib-frontend=buildingbite/walklib_frontend:v1.2

# 롤링 업데이트 상태 확인
kubectl rollout status deployment/walklib-frontend
```

## 📚 더 많은 정보

- Frontend 배포 가이드: [frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md)
- Helm Chart 사용: [helm-charts/walklib-frontend/](helm-charts/walklib-frontend/)
- 기존 스크립트 (ConfigMap 버전): [scripts/deploy-to-k8s-stable.sh](scripts/deploy-to-k8s-stable.sh)