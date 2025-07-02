# WalkLib Scripts

WalkLib 프로젝트의 핵심 스크립트들입니다.

## 📋 주요 스크립트

### 🚀 배포 및 운영

| 스크립트 | 설명 | 사용법 |
|----------|------|--------|
| `init.sh` | 시스템 초기 설정 (kubectl, Docker 설치) | `./scripts/init.sh` |
| `deploy.sh` | **메인 배포 스크립트** ⭐ | `./scripts/deploy.sh` |

### 📊 모니터링 및 상태 확인

| 스크립트 | 설명 | 사용법 |
|----------|------|--------|
| `status.sh` | 서비스 상태 및 접속 URL 확인 | `./scripts/status.sh` |

### 🔧 로컬 개발

| 스크립트 | 설명 | 사용법 |
|----------|------|--------|
| `run-local.sh` | 로컬 Docker Compose 실행 | `./scripts/run-local.sh` |

### 🧪 테스트

| 폴더 | 설명 |
|-------|------|
| `test-req/` | HTTP API 테스트 파일들 |

## 🎯 권장 사용 순서

1. **초기 설정**: `./scripts/init.sh`
2. **메인 배포**: `./scripts/deploy.sh`
3. **상태 확인**: `./scripts/status.sh`

## 🚀 메인 배포 스크립트 (deploy.sh)

### 주요 기능:
- ✅ .env 파일에서 OpenAI API 키 자동 읽기
- 🤖 AI 서비스에 API 키 자동 설정
- 🚀 모든 서비스 자동 배포
- 📡 LoadBalancer IP 자동 확인
- 🔄 기존 서비스 업데이트 (rollout)

### 사용법:
```bash
# 전체 배포 (AI 서비스 포함)
./scripts/deploy.sh

# 도움말 확인
./scripts/deploy.sh --help

# 모든 리소스 정리
./scripts/deploy.sh --cleanup
```

### 배포되는 서비스:
- **Infrastructure**: Zookeeper, Kafka
- **Backend Services**: User, Author, Book, Point, Subscription, Writing, AI System, Gateway
- **Frontend**: React 애플리케이션

### 네트워크 구성:
- **Frontend & Gateway**: LoadBalancer (외부 접근 가능)
- **나머지 서비스들**: ClusterIP (내부 통신)

## 🔍 트러블슈팅

- **서비스 상태 확인**: `kubectl get pods,svc`
- **로그 확인**: `kubectl logs deployment/<service-name>`
- **Frontend 접속**: `./scripts/status.sh`로 URL 확인
- **API 테스트**: `test-req/` 폴더의 HTTP 파일 사용
- **AI 서비스 로그**: `kubectl logs deployment/walklib-aisystem`

## 💡 팁

### AI 기능 활성화:
1. 루트 디렉토리에 `.env` 파일 생성
2. `OPENAI_API_KEY=your_api_key_here` 추가
3. `./scripts/deploy.sh` 실행

### 빠른 재배포:
기존 서비스가 실행 중이라면 `./scripts/deploy.sh`를 다시 실행하면 자동으로 롤아웃됩니다.