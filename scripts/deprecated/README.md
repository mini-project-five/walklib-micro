# Deprecated Scripts

이 폴더에는 더 이상 사용하지 않는 스크립트들이 있습니다.

## 파일 목록:
- `deploy-to-k8s.sh` - 기본 K8s 배포 (문제 많음) → `deploy-to-k8s-stable.sh` 사용 권장
- `build-and-deploy.sh` - 빌드 + 배포 (복잡함)
- `docker-port-check.sh` - 포트 체크 (health-check에 포함됨)
- `docker-start.sh` - Docker 시작 (`run.sh`로 대체)
- `init.sh` - 초기화 (불필요)
- `kill-port-conflicts.sh` - 포트 충돌 해결 (`run.sh`에 포함됨)
- `quick-deploy.sh` - 빠른 배포 (불안정)
- `setup-environment.sh` - 환경 설정 (자동화됨)
- `stop-local.sh` - 로컬 중지 (`stop.sh`로 통합)
- `test-api.sh` - API 테스트 (수동 테스트 권장)
- `wait-for-services.sh` - 서비스 대기 (K8s에서 불필요)

필요하다면 언제든지 복구할 수 있습니다.