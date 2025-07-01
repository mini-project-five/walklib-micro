# 📚 WalkLib Micro - 도보 도서관 마이크로서비스

[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)](https://microservices.io/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61dafb)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-6db33f)](https://spring.io/projects/spring-boot)
[![Database](https://img.shields.io/badge/Message%20Queue-Kafka-black)](https://kafka.apache.org/)

> 📖 Event-driven 마이크로서비스 아키텍처 기반의 도보 도서관 플랫폼

## 🎯 프로젝트 개요

WalkLib Micro는 도서 관리, 작가 관리, 구독 서비스, 포인트 시스템, AI 기반 콘텐츠 생성을 제공하는 현대적인 마이크로서비스 플랫폼입니다.

## 🏗️ 아키텍처

### 마이크로서비스 구성

| 서비스 | 포트 | 역할 |
|--------|------|------|
| **Gateway** | 8080 | API 게이트웨이 & 라우팅 |
| **User Management** | 8081 | 사용자 관리 |
| **Author Management** | 8082 | 작가 관리 및 승인 |
| **Book Management** | 8083 | 도서 관리 |
| **Content Writing** | 8084 | 원고 작성 및 관리 |
| **Point Management** | 8085 | 포인트 시스템 |
| **Subscription** | 8086 | 구독 서비스 |
| **AI System** | 8087 | AI 기반 콘텐츠 생성 |
| **Frontend** | 80 | React 기반 웹 인터페이스 |

### 기술 스택

**Frontend:**
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + shadcn/ui
- React Router DOM

**Backend:**
- Spring Boot 2.1.1
- Spring Cloud Gateway
- Apache Kafka (메시지 큐)
- JPA/Hibernate

**Infrastructure:**
- Docker & Docker Compose
- Nginx (Frontend 서빙)
- Zookeeper + Kafka

## 🚀 빠른 시작

### 필수 요구사항

- Docker & Docker Compose
- Git
- Java 21 (자동 설치됨)
- Node.js 14+ (자동 설치됨)

### 🔧 설치 및 실행

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd walklib-micro
```

#### 2. 초기 설정 (최초 1회만)
```bash
# 시스템 도구 설치 및 인프라 서비스 시작
./init.sh

# Java 환경 설정 및 마이크로서비스 빌드
A
```

#### 3. 서비스 실행
```bash
# 모든 서비스 실행 (Docker 기반)
sudo ./run.sh
```

#### 4. 서비스 중지
```bash
# 모든 서비스 중지
./stop.sh
```

### 🎯 원클릭 실행 (권장)
```bash
# 최초 설정부터 실행까지 한 번에
./init.sh && ./setup-environment.sh && ./run.sh
```

## 🌐 접속 정보

실행 완료 후 다음 URL로 접속할 수 있습니다:

- **Frontend**: http://localhost (포트 80)
- **API Gateway**: http://localhost:8080
- **각 마이크로서비스**: http://localhost:808X (X는 서비스별 포트)

## 📊 서비스 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps --filter name=walklib_

# 서비스 로그 확인
docker logs walklib_<service_name>

# 예시: Gateway 로그 확인
docker logs walklib_gateway
```

## 🧪 API 테스트

### HTTPie를 사용한 API 테스트

```bash
# 사용자 생성
http :8080/users userId="user001" email="user@example.com" userName="홍길동" role="READER"

# 도서 조회
http :8080/books

# 포인트 조회
http :8080/points userId="user001"

# 구독 생성
http :8080/subscriptions userId="user001" status="ACTIVE"
```

### cURL을 사용한 API 테스트

```bash
# 사용자 생성
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"userId":"user001","email":"user@example.com","userName":"홍길동","role":"READER"}'

# 도서 목록 조회
curl http://localhost:8080/books
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

### 서비스 재빌드

```bash
# 모든 서비스 재빌드
./setup-environment.sh

# 특정 서비스만 빌드
cd <service_name>
mvn clean package -DskipTests
```

## 🐳 Docker 이미지 관리

### 이미지 빌드 및 배포

```bash
# 빠른 배포 (개발용)
./quick-deploy.sh

# 특정 서비스 배포
./build-and-deploy.sh <service_name>

# 로컬 테스트
./quick-deploy.sh dev

# 프로덕션 배포
./build-and-deploy.sh all v1.0.0
```

### 사용 중인 Docker 이미지

- `buildingbite/walklib_gateway:v1.0.0`
- `buildingbite/walklib_user:v1.0.0`
- `buildingbite/walklib_author:v1.0.0`
- `buildingbite/walklib_book:v1.0.0`
- `buildingbite/walklib_writing:v1.0.0`
- `buildingbite/walklib_point:v1.0.0`
- `buildingbite/walklib_subscription:v1.0.0`
- `buildingbite/walklib_aisystem:v1.0.0`
- `buildingbite/walklib_frontend:v1.0.1`

## 🔍 모니터링 및 디버깅

### Kafka 메시지 확인

```bash
# Kafka 컨테이너 접속
cd infra
docker-compose exec kafka /bin/bash

# 토픽 메시지 실시간 모니터링
cd /bin
./kafka-console-consumer --bootstrap-server localhost:9092 --topic <topic_name>
```

### 서비스 헬스체크

```bash
# Gateway 헬스체크
curl http://localhost:8080/actuator/health

# 개별 서비스 헬스체크
curl http://localhost:808X/actuator/health
```

## 🛠️ 문제 해결

### 일반적인 문제들

**1. 컨테이너 시작 실패**
```bash
# 기존 컨테이너 정리 후 재시작
./stop.sh
./run.sh
```

**2. 포트 충돌**
```bash
# 사용 중인 포트 확인
sudo ss -tlnp | grep :80XX

# 해당 프로세스 종료 후 재시작
sudo pkill -f <process_name>
```

**3. 이미지 Pull 실패**
```bash
# Docker Hub 로그인 확인
docker login

# 수동으로 이미지 pull
docker pull buildingbite/walklib_frontend:v1.0.1
```

**4. Frontend 접속 불가**
```bash
# Frontend 컨테이너 상태 확인
docker ps --filter name=walklib_frontend

# Frontend 컨테이너 재시작
docker restart walklib_frontend
```

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
├── 🚀 init.sh                  # 초기 환경 설정
├── 🔧 setup-environment.sh     # 개발 환경 설정
├── ▶️ run.sh                    # 서비스 실행
├── ⏹️ stop.sh                   # 서비스 중지
└── 📖 README.md                # 이 파일
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🔗 관련 링크

- [모델 설계](https://www.msaez.io/#/31334541/storming/3efacb35baa219662388e54c2dc76f3b)
- [마이크로서비스 아키텍처 패턴](https://microservices.io/)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Apache Kafka](https://kafka.apache.org/)

---

💡 **도움이 필요하시나요?** 이슈를 등록하거나 문서를 참고해주세요!