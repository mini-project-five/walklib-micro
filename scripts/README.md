# WalkLib Scripts 사용 가이드

## 🚀 주요 스크립트

### Kubernetes 배포
- **`deploy-to-k8s-stable.sh`** ⭐ **추천** - 완전 자동화된 Kubernetes 배포 (모든 문제 해결 포함)
- **`deploy-to-k8s.sh`** - 기본 Kubernetes 배포 (문제 발생 가능)

### 로컬 Docker 실행
- **`run.sh`** - Docker Compose 방식 로컬 실행
- **`run-local.sh`** - 로컬 개발용 실행

### 유틸리티
- **`docker-health-check.sh`** - Docker 서비스 상태 확인
- **`stop.sh`** - 모든 Docker 서비스 중지

## 🎯 권장 사용법

### Kubernetes에 배포하고 싶다면:
```bash
./scripts/deploy-to-k8s-stable.sh
```

### 로컬에서 개발하고 싶다면:
```bash
./scripts/run.sh
```

### 상태 확인:
```bash
./scripts/docker-health-check.sh
```

### 정리:
```bash
./scripts/stop.sh
```

## 📁 정리된 파일들
불필요한 스크립트들은 `deprecated/` 폴더로 이동되었습니다.