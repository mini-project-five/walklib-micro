# WalkLib Frontend 배포 가이드

## 개요
이 문서는 WalkLib Frontend를 Kubernetes에 배포하는 방법을 설명합니다.

## Docker 이미지
- **Repository**: `buildingbite/walklib_frontend`
- **Latest**: `buildingbite/walklib_frontend:latest`
- **Stable**: `buildingbite/walklib_frontend:v1.1`

## 배포 방법

### 방법 1: 단독 배포 (ConfigMap 불필요)
```bash
# 단일 명령으로 배포
kubectl apply -f k8s-deployment-standalone.yaml

# 또는 이미지 직접 배포
kubectl create deployment walklib-frontend --image=buildingbite/walklib_frontend:v1.1
kubectl expose deployment walklib-frontend --port=80 --type=LoadBalancer
```

### 방법 2: Helm Chart 사용
```bash
# Helm chart 디렉토리로 이동
cd ../helm-charts/walklib-frontend

# 배포
helm install walklib-frontend .

# 값 커스터마이징
helm install walklib-frontend . --set image.tag=v1.1

# 업그레이드
helm upgrade walklib-frontend . --set image.tag=v1.2
```

### 방법 3: 전체 스택 배포 스크립트
```bash
cd /workspace/walklib-micro
bash scripts/deploy-to-k8s-stable.sh
```

## 주요 기능
- ✅ AI 표지 생성 (DALL-E)
- ✅ AI 텍스트 다듬기 (GPT)
- ✅ 실시간 이미지 미리보기
- ✅ 모든 마이크로서비스 통합

## 환경 변수
- `VITE_API_BASE_URL`: API Gateway URL (기본값: 상대 경로)

## 업데이트 방법
1. 코드 수정
2. `npm run build`
3. `docker build -t buildingbite/walklib_frontend:v1.2 .`
4. `docker push buildingbite/walklib_frontend:v1.2`
5. `kubectl set image deployment/walklib-frontend walklib-frontend=buildingbite/walklib_frontend:v1.2`

## 트러블슈팅
- **이미지가 안 보일 때**: 브라우저 개발자 도구에서 네트워크 탭 확인
- **API 호출 실패**: Gateway 서비스 상태 확인 (`kubectl get svc walklib-gateway`)
- **로그 확인**: `kubectl logs deployment/walklib-frontend`