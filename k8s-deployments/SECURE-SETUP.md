# 🔐 진정한 보안 배포 가이드

## ⚠️ 중요한 보안 고려사항

현재 제공되는 배포 방법들의 **실제 보안 수준**:

| 배포 방법 | 파일 | 실제 보안 수준 | 이유 |
|----------|------|---------------|------|
| 기본 배포 | `all-in-one.yaml` | ❌ **낮음** | 코드에 하드코딩 |
| 보안 배포 | `secure-deployment.yaml` | ⚠️ **중간** | YAML에 하드코딩 |
| 진정한 보안 배포 | 아래 가이드 | ✅ **높음** | 완전 분리 |

## 🎯 올바른 보안 배포 방법

### 1단계: API 키를 안전하게 준비
```bash
# 방법 1: 환경 변수에서 읽기
export OPENAI_API_KEY="your-actual-api-key-here"

# 방법 2: 파일에서 읽기 (권장)
echo "your-actual-api-key-here" > /tmp/openai-key.txt
chmod 600 /tmp/openai-key.txt  # 파일 권한 제한
```

### 2단계: Secret 생성 (배포 파일에 키 노출 없음)
```bash
# 방법 1: 환경 변수 사용
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY"

# 방법 2: 파일 사용 (더 안전)
kubectl create secret generic openai-secret \
  --from-file=OPENAI_API_KEY=/tmp/openai-key.txt

# 방법 3: 대화형 입력
read -s OPENAI_API_KEY
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY"
unset OPENAI_API_KEY
```

### 3단계: 키 파일 정리
```bash
# 임시 파일 삭제
rm -f /tmp/openai-key.txt

# 환경 변수 정리
unset OPENAI_API_KEY

# 히스토리 정리 (선택사항)
history -d $(history 1)
```

### 4단계: 안전한 배포
```bash
# Secret이 생성되었는지 확인
kubectl get secret openai-secret

# 배포 실행 (API 키 없는 버전)
kubectl apply -f k8s-deployments/secure-deployment.yaml
```

## 🔍 보안 수준 비교

### ❌ 잘못된 방법들
```bash
# 1. 명령어에 키 직접 입력 (히스토리에 남음)
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="sk-proj-actual-key"

# 2. YAML 파일에 키 하드코딩
apiVersion: v1
kind: Secret
metadata:
  name: openai-secret
stringData:
  OPENAI_API_KEY: "sk-proj-actual-key"  # ❌ Git에 커밋됨

# 3. 환경 변수를 .bashrc에 저장
echo 'export OPENAI_API_KEY="sk-proj-actual-key"' >> ~/.bashrc  # ❌
```

### ✅ 올바른 방법들
```bash
# 1. 안전한 파일에서 읽기
echo "sk-proj-actual-key" | kubectl create secret generic openai-secret \
  --from-file=OPENAI_API_KEY=/dev/stdin

# 2. 외부 시크릿 관리자 사용
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="$(vault kv get -field=api_key secret/openai)"

# 3. CI/CD 파이프라인에서 주입
# GitHub Actions, GitLab CI 등의 Secret Variables 사용
```

## 🏢 프로덕션 환경 권장사항

### 1. 외부 Secret 관리자 사용
```bash
# HashiCorp Vault
vault kv put secret/openai api_key="your-key"
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="$(vault kv get -field=api_key secret/openai)"

# AWS Secrets Manager
aws secretsmanager create-secret \
  --name "openai-api-key" \
  --secret-string "your-key"

# Azure Key Vault
az keyvault secret set \
  --vault-name "your-vault" \
  --name "openai-api-key" \
  --value "your-key"
```

### 2. Kubernetes External Secrets 사용
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
spec:
  provider:
    vault:
      server: "https://vault.example.com"
      path: "secret"
      version: "v2"
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: openai-secret
spec:
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: openai-secret
    creationPolicy: Owner
  data:
  - secretKey: OPENAI_API_KEY
    remoteRef:
      key: openai
      property: api_key
```

### 3. RBAC 설정
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["openai-secret"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-openai-secret
subjects:
- kind: ServiceAccount
  name: walklib-aisystem
roleRef:
  kind: Role
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

## 🧹 Secret 관리 명령어

### Secret 확인
```bash
# Secret 목록
kubectl get secrets

# Secret 상세 정보
kubectl describe secret openai-secret

# Secret 값 확인 (주의: 평문으로 표시됨)
kubectl get secret openai-secret -o jsonpath='{.data.OPENAI_API_KEY}' | base64 -d
```

### Secret 업데이트
```bash
# 기존 Secret 삭제
kubectl delete secret openai-secret

# 새 키로 재생성
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="new-api-key"

# Pod 재시작하여 새 키 적용
kubectl rollout restart deployment/walklib-aisystem
```

### Secret 백업/복원
```bash
# 백업 (키 값 제외)
kubectl get secret openai-secret -o yaml | \
  sed 's/OPENAI_API_KEY: .*/OPENAI_API_KEY: <REDACTED>/' > secret-backup.yaml

# 복원 시 키 값 수동 입력 필요
```

## 🚨 보안 체크리스트

- [ ] API 키가 Git 히스토리에 없음
- [ ] 명령어 히스토리에 키가 없음
- [ ] YAML 파일에 키가 하드코딩되지 않음
- [ ] 임시 파일이 안전하게 삭제됨
- [ ] Secret에 적절한 RBAC 설정됨
- [ ] 정기적인 키 순환 계획 수립됨
- [ ] 모니터링 및 감사 로그 설정됨