# 📚 WalkLib Micro - 걷다가, 서재

[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)](https://microservices.io/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61dafb)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-6db33f)](https://spring.io/projects/spring-boot)
[![Message Queue](https://img.shields.io/badge/Message%20Queue-Kafka-black)](https://kafka.apache.org/)
[![AI](https://img.shields.io/badge/AI-OpenAI%20GPT-00a67e)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed)](https://docker.com/)

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

| 서비스 | 로컬 포트 | Docker 포트 | 역할 |
|--------|-----------|-------------|------|
| **Gateway** | 8088 | 8088:8080 | API 게이트웨이 & 라우팅 |
| **User Management** | 8082 | 8082:8080 | 사용자 관리 & 인증 |
| **Point Management** | 8083 | 8083:8080 | 포인트 시스템 |
| **Subscription Management** | 8084 | 8084:8080 | 구독 서비스 |
| **Book Management** | 8085 | 8085:8080 | 도서 관리 & 베스트셀러 |
| **Author Management** | 8086 | 8086:8080 | 작가 관리 및 승인 |
| **Content Writing** | 8087 | 8087:8080 | 원고 작성 및 관리 |
| **AI System** | 8089 | 8089:8080 | AI 기반 콘텐츠 생성 |
| **Frontend** | 5173 | 3000:80 | React 기반 웹 인터페이스 |
| **Kafka** | 9092 | 9092:9092 | 이벤트 스트리밍 |
| **Zookeeper** | 2181 | 2181:2181 | Kafka 코디네이터 |

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
- Docker Networks (서비스 격리)
- Health Checks & Auto-restart
- Zookeeper + Kafka

## 🚀 빠른 시작

### 필수 요구사항

- Docker & Docker Compose
- Git
- 최소 8GB RAM (권장: 16GB)
- Java 11+ (Docker 컨테이너에서 자동 설치)
- Node.js 18+ (Docker 컨테이너에서 자동 설치)

### 🔧 설치 및 실행

#### 방법 1: 🎯 스마트 시작 (권장)
```bash
# 저장소 클론
git clone <repository-url>
cd walklib-micro

# 포트 충돌 확인 및 해결 후 자동 시작
./docker-start.sh
```

#### 방법 2: 🛠️ 단계별 실행
```bash
# 1. 포트 충돌 확인
./docker-port-check.sh

# 2. 충돌 해결 (필요시)
./kill-port-conflicts.sh

# 3. 서비스 시작
docker-compose -f build-docker-compose.yml up -d

# 4. 헬스체크
./docker-health-check.sh
```

#### 방법 3: 🏭 프로덕션 모드
```bash
# 프로덕션용 컨테이너로 실행
./docker-start.sh --prod
```

### ⏹️ 서비스 중지
```bash
# 모든 서비스 중지
docker-compose -f build-docker-compose.yml down

# 또는 스마트 스크립트 사용
./stop.sh
```

## 🌐 접속 정보

실행 완료 후 다음 URL로 접속할 수 있습니다:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8088
- **각 마이크로서비스**: http://localhost:808X (X는 서비스별 포트)

## 📊 서비스 상태 확인

### 자동 헬스체크
```bash
# 전체 서비스 상태 확인 (권장)
./docker-health-check.sh

# 포트 충돌 확인
./docker-port-check.sh
```

### 수동 확인
```bash
# 실행 중인 컨테이너 확인
docker ps --filter name=walklib_

# 서비스 로그 확인
docker logs walklib_<service_name>

# 예시: Gateway 로그 확인
docker logs walklib_gateway

# 컨테이너 리소스 사용량 확인
docker stats --no-stream $(docker ps --filter "name=walklib" --format "{{.Names}}")
```

## 🧪 API 테스트

### Gateway를 통한 API 테스트

```bash
# 사용자 로그인
curl -X POST http://localhost:8088/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 도서 목록 조회
curl http://localhost:8088/books

# AI 텍스트 다듬기
curl -X POST http://localhost:8088/ai/polish \
  -H "Content-Type: application/json" \
  -d '{"title":"제목","content":"내용을 다듬어주세요"}'

# 포인트 조회
curl http://localhost:8088/points/user001

# 작가 신청
curl -X POST http://localhost:8088/authors/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"user001","penName":"펜네임","introduction":"소개글"}'
```

### 직접 서비스 API 테스트

```bash
# 사용자 서비스 직접 접근
curl -X POST http://localhost:8082/users \
  -H "Content-Type: application/json" \
  -d '{"userId":"user001","email":"user@example.com","userName":"홍길동","role":"READER"}'

# AI 서비스 직접 접근
curl -X POST http://localhost:8089/ai/summary \
  -H "Content-Type: application/json" \
  -d '{"content":"요약할 텍스트 내용"}'
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
# 포트 충돌 자동 확인
./docker-port-check.sh

# 포트 충돌 자동 해결
./kill-port-conflicts.sh

# 또는 수동으로 특정 포트 확인
sudo ss -tlnp | grep :80XX

# 해당 프로세스 종료
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

# Frontend 로그 확인
docker logs walklib_frontend

# 브라우저에서 http://localhost:3000 접속 확인
```

**5. 서비스 간 통신 문제**
```bash
# Gateway를 통한 서비스 연결 테스트
./docker-health-check.sh

# Kafka 상태 확인 (서비스 간 이벤트 통신)
docker logs walklib_kafka

# 네트워크 연결 확인
docker network ls
docker network inspect walklib-micro_default
```

**6. AI 서비스 관련 문제**
```bash
# AI 서비스 로그 확인
docker logs walklib_ai_system_management

# OpenAI API 키 설정 확인 (환경변수)
echo $OPENAI_API_KEY

# AI 서비스 헬스체크
curl http://localhost:8089/actuator/health
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
├── 🚀 docker-start.sh           # 스마트 서비스 시작 (권장)
├── 🔍 docker-port-check.sh      # 포트 충돌 확인
├── 🔧 kill-port-conflicts.sh    # 포트 충돌 해결
├── 🏥 docker-health-check.sh    # 서비스 헬스체크
├── 🐳 build-docker-compose.yml  # Docker Compose 설정
├── 🔧 setup-environment.sh      # 개발 환경 설정
├── ▶️ run.sh                     # 레거시 서비스 실행
├── ⏹️ stop.sh                    # 서비스 중지
├── 📁 logs/                     # 서비스 로그 파일들
└── 📖 README.md                 # 이 문서
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🎯 핵심 개선사항

### 🚀 스마트 시작 시스템
- **자동 포트 충돌 감지 및 해결**: `docker-start.sh`로 원클릭 시작
- **종속성 기반 순차 시작**: Kafka → Backend Services → Gateway → Frontend
- **실시간 헬스체크**: 모든 서비스 상태를 자동으로 모니터링

### 🔧 DevOps 자동화
- **포트 관리 자동화**: 충돌 감지, 해결, 모니터링 스크립트
- **서비스 간 연결성 테스트**: Gateway를 통한 Backend 연결 확인
- **리소스 모니터링**: CPU, 메모리 사용량 실시간 추적
- **로그 집중화**: 각 서비스별 로그 파일 관리

### 🤖 AI 기능 강화
- **실시간 텍스트 다듬기**: OpenAI GPT 기반 콘텐츠 품질 향상
- **자동 요약 생성**: 긴 텍스트의 핵심 내용 추출
- **표지 이미지 생성**: DALL-E를 활용한 자동 표지 제작
- **AI 피드백 시스템**: 작가를 위한 실시간 작성 도우미

### 🎨 사용자 경험 개선
- **반응형 웹 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **실시간 상태 업데이트**: React Query 기반 캐싱 및 동기화
- **직관적인 UI/UX**: shadcn/ui 컴포넌트 기반 모던 인터페이스
- **작가 도구 통합**: 원고 작성부터 출간까지 원스톱 서비스

## 📈 성능 및 확장성

### Docker 최적화
- **멀티스테이지 빌드**: 이미지 크기 최소화
- **헬스체크 내장**: 컨테이너 자동 복구
- **네트워크 격리**: 서비스별 독립된 네트워크 환경
- **볼륨 마운트**: 개발 환경 실시간 코드 반영

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
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

💡 **도움이 필요하시나요?** 이슈를 등록하거나 문서를 참고해주세요!

🚀 **새로운 기능 제안이나 버그 리포트는 언제든 환영합니다!**