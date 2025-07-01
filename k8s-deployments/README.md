# Kubernetes 배포 옵션

## 배포 방법 선택

### 1. 기본 배포 (API 키 포함)
```bash
kubectl apply -f all-in-one.yaml
```
- 가장 간단한 방법
- 모든 설정이 이미지에 포함되어 있음

### 2. 보안 배포 (환경 변수 사용) ⭐ 권장
```bash
kubectl apply -f secure-deployment.yaml
```
- API 키가 Kubernetes Secret으로 관리됨
- 더 안전한 방법

### 3. 커스텀 API 키 사용
```bash
# 1. API 키가 들어있는 Secret 생성
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="your-openai-api-key-here"

# 2. 나머지 서비스 배포 (AI 서비스 제외)
kubectl apply -f secure-deployment.yaml
```

## API 키 관리

### Secret 생성
```bash
# 방법 1: 직접 생성
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="sk-proj-your-key-here"

# 방법 2: 파일에서 생성
echo "sk-proj-your-key-here" > api-key.txt
kubectl create secret generic openai-secret \
  --from-file=OPENAI_API_KEY=api-key.txt
rm api-key.txt  # 보안을 위해 삭제
```

### Secret 확인
```bash
kubectl get secrets
kubectl describe secret openai-secret
```

### Secret 업데이트
```bash
kubectl delete secret openai-secret
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="new-api-key"
kubectl rollout restart deployment/walklib-aisystem
```

## AI 기능 테스트

### 1. 배포 후 확인
```bash
# Pod 상태 확인
kubectl get pods

# AI 서비스 로그 확인
kubectl logs deployment/walklib-aisystem

# API 키 설정 확인 (로그에서 "OpenAI API Key configured" 메시지 찾기)
kubectl logs deployment/walklib-aisystem | grep "OpenAI"
```

### 2. Frontend 접속
```bash
# Frontend URL 확인
kubectl get svc walklib-frontend

# 브라우저에서 http://<EXTERNAL-IP> 접속
# 작가 로그인 → 새 작품 만들기 → AI 표지 생성 테스트
```

## 트러블슈팅

### API 키 관련 문제
```bash
# AI 서비스 로그 확인
kubectl logs deployment/walklib-aisystem -f

# 예상 로그:
# ✅ "OpenAI API Key configured: sk-proj-..."
# ❌ "WARNING: OpenAI API Key not configured"
```

### Secret 문제
```bash
# Secret 존재 확인
kubectl get secret openai-secret

# Secret 내용 확인 (base64 디코딩)
kubectl get secret openai-secret -o jsonpath='{.data.OPENAI_API_KEY}' | base64 -d
```

### AI 기능 문제
```bash
# API 호출 로그 확인
kubectl logs deployment/walklib-aisystem | grep -i "dall-e\|gpt\|openai"

# 예상 로그:
# ✅ "Attempting to generate cover with DALL-E"
# ✅ "Received response: SUCCESS"
# ❌ "Using fallback after 3 second delay"
```

## 보안 베스트 프랙티스

1. **Secret 사용**: API 키는 항상 Kubernetes Secret으로 관리
2. **RBAC 설정**: Secret 접근 권한 제한
3. **로깅 주의**: API 키가 로그에 노출되지 않도록 주의
4. **정기 교체**: API 키 정기적으로 교체

## 배포 파일 비교

| 파일 | 방법 | 보안성 | 간편성 |
|------|------|--------|--------|
| `all-in-one.yaml` | 하드코딩 | ⚠️ 낮음 | ✅ 높음 |
| `secure-deployment.yaml` | Secret | ✅ 높음 | ⚠️ 중간 |