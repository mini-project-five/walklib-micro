# 📚 WalkLib Micro - 걷다가, 서재

[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)](https://microservices.io/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61dafb)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-6db33f)](https://spring.io/projects/spring-boot)
[![Message Queue](https://img.shields.io/badge/Message%20Queue-Kafka-black)](https://kafka.apache.org/)
[![AI](https://img.shields.io/badge/AI-OpenAI%20GPT-00a67e)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed)](https://docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326ce5)](https://kubernetes.io/)

> 📖 AI 기반 콘텐츠 생성과 Event-driven 마이크로서비스 아키텍처로 구축된 현대적인 디지털 도서관 플랫폼

## 🎯 프로젝트 개요

WalkLib Micro("걷다가, 서재")는 AI 기반 콘텐츠 생성, 작가 지원 도구, 구독 서비스, 포인트 시스템을 통합한 현대적인 디지털 도서관 플랫폼입니다.

### ✨ 주요 기능

- 🤖 **AI 기반 콘텐츠 생성**: OpenAI GPT를 활용한 텍스트 다듬기, 표지 생성, 요약 생성
- ✍️ **작가 지원 도구**: 실시간 원고 편집, AI 보조 기능, 출간 요청 시스템
- 📚 **스마트 도서 관리**: 자동 베스트셀러 선정, 조회수 추적, 카테고리별 분류
- 👥 **사용자 관리**: 독자/작가 구분, 권한 관리, 작가 승인 시스템
- 💰 **포인트 & 구독**: 유연한 포인트 시스템, 구독 기반 서비스 이용
- 🚀 **반응형 웹**: 모던 React UI, 모바일 최적화, 실시간 상태 업데이트

## 🏗️ 아키텍처

### 마이크로서비스 구성

| 서비스 | 로컬 포트 | Kubernetes | 역할 |
|--------|-----------|------------|------|
| **Gateway** | 8088 | walklib-gateway:8080 | API 게이트웨이 & 라우팅 |
| **User Management** | 8082 | walklib-user:8080 | 사용자 관리 & 인증 |
| **Point Management** | 8083 | walklib-point:8080 | 포인트 시스템 |
| **Subscription Management** | 8084 | walklib-subscription:8080 | 구독 서비스 |
| **Book Management** | 8085 | walklib-book:8080 | 도서 관리 & 베스트셀러 |
| **Author Management** | 8086 | walklib-author:8080 | 작가 관리 및 승인 |
| **Content Writing** | 8087 | walklib-writing:8080 | 원고 작성 및 관리 |
| **AI System** | 8089 | walklib-aisystem:8080 | AI 기반 콘텐츠 생성 |
| **Frontend** | 5173 | walklib-frontend:80 | React 기반 웹 인터페이스 |
| **Kafka** | 9092 | kafka:9092 | 이벤트 스트리밍 |
| **Zookeeper** | 2181 | zookeeper:2181 | Kafka 코디네이터 |

### 기술 스택

**Frontend:**
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + shadcn/ui
- React Router DOM
- React Query (API 상태 관리)
- Lucide React (아이콘)

**Backend:**
- Spring Boot 2.1.1
- Spring Cloud Gateway
- Apache Kafka (이벤트 스트리밍)
- JPA/Hibernate
- Spring Data REST

**AI & External APIs:**
- OpenAI GPT-3.5/4 (텍스트 생성 및 다듬기)
- OpenAI DALL-E (이미지 생성)
- 실시간 AI 피드백 시스템

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes (AKS 지원)
- Docker Networks (서비스 격리)
- Health Checks & Auto-restart
- Zookeeper + Kafka (Bitnami 안정 버전)

## 🚀 빠른 시작

### 필수 요구사항

- **로컬 실행**: Docker & Docker Compose
- **Kubernetes 실행**: kubectl + Azure CLI (AKS)
- Git
- 최소 8GB RAM (권장: 16GB)

### 🎯 권장 실행 방법

#### Option 1: Kubernetes 배포 (운영 환경, 권장) ⭐

```bash
# 저장소 클론
git clone <repository-url>
cd walklib-micro

# Kubernetes 클러스터 연결 (AKS 예시)
az aks get-credentials --resource-group <resource-group> --name <cluster-name>

# 완전 자동화 배포 (모든 문제 해결 포함)
./scripts/deploy-to-k8s-stable.sh
```

#### Option 2: 로컬 Docker 실행 (개발 환경)

```bash
# 포트 충돌 확인 및 해결 후 자동 시작
./scripts/run.sh

# 상태 확인
./scripts/docker-health-check.sh
```

### 🛠️ 기타 스크립트들

```bash
# 서비스 중지
./scripts/stop.sh

# Kubernetes 리소스 정리
./scripts/deploy-to-k8s-stable.sh --cleanup

# 로컬 개발 실행
./scripts/run-local.sh
```

## 🌐 접속 정보

### Kubernetes 배포 시
스크립트 실행 후 LoadBalancer IP가 할당됩니다:
- **Frontend**: http://`<FRONTEND_IP>`
- **Gateway**: http://`<GATEWAY_IP>`:8080

### 로컬 Docker 실행 시
- **Frontend**: http://localhost:3000
- **Gateway**: http://localhost:8088
- **각 마이크로서비스**: http://localhost:808X

## 📊 서비스 상태 확인

### Kubernetes 환경
```bash
# 전체 리소스 확인
kubectl get all

# 서비스 상태 확인
kubectl get services

# Pod 로그 확인
kubectl logs deployment/walklib-gateway
```

### Docker 환경
```bash
# 전체 서비스 상태 확인 (권장)
./scripts/docker-health-check.sh

# 실행 중인 컨테이너 확인
docker ps --filter name=walklib_

# 특정 서비스 로그 확인
docker logs walklib_gateway
```

## 🧪 API 테스트

### Gateway를 통한 API 테스트

```bash
# 사용자 목록 조회
curl http://<GATEWAY_URL>/users

# 도서 목록 조회
curl http://<GATEWAY_URL>/books

# 작가 목록 조회
curl http://<GATEWAY_URL>/authors

# AI 텍스트 다듬기
curl -X POST http://<GATEWAY_URL>/ai/polish \
  -H "Content-Type: application/json" \
  -d '{"title":"제목","content":"내용을 다듬어주세요"}'
```

## 🔧 개발 가이드

### 개별 서비스 개발 실행

```bash
# 특정 서비스만 로컬에서 실행 (예: User Management)
cd user_management
mvn spring-boot:run
```

### Frontend 개발 실행

```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker 이미지 관리

### 사용 중인 Docker 이미지

- `buildingbite/walklib_gateway:latest`
- `buildingbite/walklib_user:latest`
- `buildingbite/walklib_author:latest`
- `buildingbite/walklib_book:latest`
- `buildingbite/walklib_writing:latest`
- `buildingbite/walklib_point:latest`
- `buildingbite/walklib_subscription:latest`
- `buildingbite/walklib_aisystem:latest`
- `buildingbite/walklib_frontend:latest`

## 🛠️ 문제 해결

### 일반적인 문제들

**1. Kubernetes 배포 실패**
```bash
# 기존 리소스 정리 후 재배포
./scripts/deploy-to-k8s-stable.sh --cleanup
./scripts/deploy-to-k8s-stable.sh
```

**2. 로컬 Docker 문제**
```bash
# 컨테이너 정리 후 재시작
./scripts/stop.sh
./scripts/run.sh
```

**3. Gateway 라우팅 문제**
- Kubernetes: 서비스명이 `walklib-*` 형태인지 확인
- 로컬: 포트 충돌 확인 (`./scripts/docker-health-check.sh`)

**4. Frontend 접속 불가**
- Kubernetes: LoadBalancer IP 할당 확인 (`kubectl get services`)
- 로컬: http://localhost:3000 접속 확인

**5. Kafka 연결 문제**
- 안정적인 Bitnami Kafka 이미지 사용
- 환경변수 설정 자동화로 해결

## 📁 프로젝트 구조

```
walklib-micro/
├── 📁 ai_system_management/     # AI 시스템 관리
├── 📁 author_management/        # 작가 관리
├── 📁 book_management/          # 도서 관리
├── 📁 content_writing_management/ # 콘텐츠 작성 관리
├── 📁 frontend/                 # React 프론트엔드
├── 📁 gateway/                  # API 게이트웨이
├── 📁 infra/                    # 인프라 (Kafka, Zookeeper)
├── 📁 point_management/         # 포인트 관리
├── 📁 subscription_management/  # 구독 관리
├── 📁 user_management/          # 사용자 관리
├── 📁 scripts/                  # 배포 및 관리 스크립트
│   ├── 🚀 deploy-to-k8s-stable.sh  # Kubernetes 완전 자동 배포 (권장)
│   ├── 🐳 run.sh                    # 로컬 Docker 실행
│   ├── 🏥 docker-health-check.sh   # 서비스 상태 확인
│   ├── ⏹️ stop.sh                   # 서비스 중지
│   ├── 📁 deprecated/               # 사용하지 않는 스크립트들
│   └── 📖 README.md                 # 스크립트 사용 가이드
├── 📁 logs/                     # 서비스 로그 파일들
└── 📖 README.md                 # 이 문서
```

## 🎯 핵심 개선사항

### 🚀 완전 자동화 배포 시스템
- **Kubernetes 완전 지원**: ConfigMap 기반 설정 주입으로 모든 호환성 문제 해결
- **문제 사전 해결**: Gateway URI 파싱, Frontend Nginx 설정, Kafka 안정성 모두 자동 해결
- **원클릭 배포**: `deploy-to-k8s-stable.sh`로 운영 환경 즉시 구축

### 🔧 DevOps 자동화
- **포트 관리 자동화**: 충돌 감지, 해결, 모니터링 스크립트
- **서비스 간 연결성 테스트**: Gateway를 통한 Backend 연결 확인
- **스크립트 정리**: 핵심 4개 스크립트로 단순화
- **ConfigMap 활용**: Docker 이미지 수정 없이 런타임 설정 변경

### 🤖 AI 기능 강화
- **실시간 텍스트 다듬기**: OpenAI GPT 기반 콘텐츠 품질 향상
- **자동 요약 생성**: 긴 텍스트의 핵심 내용 추출
- **표지 이미지 생성**: DALL-E를 활용한 자동 표지 제작
- **AI 피드백 시스템**: 작가를 위한 실시간 작성 도우미

### 🎨 사용자 경험 개선
- **반응형 웹 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **실시간 상태 업데이트**: React Query 기반 캐싱 및 동기화
- **직관적인 UI/UX**: shadcn/ui 컴포넌트 기반 모던 인터페이스
- **LoadBalancer 자동 설정**: 외부 접근 자동 구성

## 📈 성능 및 확장성

### Kubernetes 최적화
- **ConfigMap 기반 설정**: 호스트명 자동 변환으로 환경별 최적화
- **Service Discovery**: Kubernetes 네이티브 서비스 발견
- **LoadBalancer 통합**: Azure AKS LoadBalancer 자동 구성
- **안정적인 Kafka**: Bitnami Kafka로 메시징 안정성 보장

### 마이크로서비스 패턴
- **이벤트 기반 아키텍처**: Kafka를 통한 비동기 통신
- **API Gateway 패턴**: 통합된 API 엔드포인트 관리
- **서킷 브레이커**: 장애 전파 방지 및 빠른 복구
- **분산 로그 관리**: 서비스별 독립적인 로그 시스템

## 🔗 관련 링크

- [모델 설계](https://www.msaez.io/#/31334541/storming/3efacb35baa219662388e54c2dc76f3b)
- [마이크로서비스 아키텍처 패턴](https://microservices.io/)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Apache Kafka](https://kafka.apache.org/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React 18 Documentation](https://react.dev/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

💡 **도움이 필요하시나요?** `./scripts/README.md`를 참고하거나 이슈를 등록해주세요!

🚀 **새로운 기능 제안이나 버그 리포트는 언제든 환영합니다!**