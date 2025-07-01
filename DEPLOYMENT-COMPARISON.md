# 배포 방법 비교: 기본 vs 보안

## 📊 전체 비교표

| 항목 | 기본 배포 | 보안 배포 | 진정한 보안 배포 |
|------|-----------|-----------|------------------|
| **파일** | `all-in-one.yaml` | `secure-deployment.yaml` | `secure-deployment.yaml` + 별도 Secret |
| **AI 이미지** | `buildingbite/walklib_aisystem:latest` | `buildingbite/walklib_aisystem:v1.2-secure` | `buildingbite/walklib_aisystem:v1.2-secure` |
| **API 키 위치** | ❌ 코드에 하드코딩 | ⚠️ YAML에 하드코딩 | ✅ 완전 분리 |
| **보안성** | ❌ 낮음 | ⚠️ 중간 | ✅ 높음 |
| **Git 안전성** | ❌ 위험 | ⚠️ 위험 | ✅ 안전 |
| **배포 복잡도** | 🟢 간단 | 🟡 보통 | 🔴 복잡 |
| **실제 권장** | 개발만 | 권장하지 않음 | 프로덕션 필수 |

## 🔍 세부 차이점

### 1. AI 서비스 배포 설정

#### 기본 배포 (`all-in-one.yaml`)
```yaml
# AI System Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: walklib-aisystem
spec:
  template:
    spec:
      containers:
      - name: walklib-aisystem
        image: buildingbite/walklib_aisystem:latest  # 하드코딩 버전
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "docker"
        # ❌ API 키 환경 변수 없음
```

#### 보안 배포 (`secure-deployment.yaml`)
```yaml
# Create Secret for OpenAI API Key (추가됨)
apiVersion: v1
kind: Secret
metadata:
  name: openai-secret
type: Opaque
stringData:
  OPENAI_API_KEY: "sk-proj-your-key-here"

---
# AI System Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: walklib-aisystem
spec:
  template:
    spec:
      containers:
      - name: walklib-aisystem
        image: buildingbite/walklib_aisystem:v1.2-secure  # 보안 버전
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "docker"
        - name: OPENAI_API_KEY  # ✅ 추가됨
          valueFrom:
            secretKeyRef:
              name: openai-secret
              key: OPENAI_API_KEY
```

### 2. 코드 레벨 차이점

#### 기본 버전 (buildingbite/walklib_aisystem:latest)
```java
// OpenAIConfig.java - 기존 버전
public OpenAIConfig() {
    // 환경 변수 시도
    this.apiKey = System.getenv("OPENAI_API_KEY");
    
    if (this.apiKey == null) {
        // ❌ 하드코딩된 fallback
        this.apiKey = "sk-proj-WbALBZw7sAnr-Jc6FafegBjMFMWbqj9dij7eZBc1I7zf...";
        System.out.println("Using hardcoded API key as fallback");
    }
}

@Bean
public RestTemplate openAIRestTemplate() {
    RestTemplate restTemplate = new RestTemplate();
    // ❌ 하드코딩된 키 사용
    String hardcodedKey = "sk-proj-WbALBZw7sAnr-Jc6FafegBjMFMWbqj9dij7eZBc1I7zf...";
    restTemplate.getInterceptors().add((request, body, execution) -> {
        request.getHeaders().add(HttpHeaders.AUTHORIZATION, "Bearer " + hardcodedKey);
        return execution.execute(request, body);
    });
    return restTemplate;
}
```

#### 보안 버전 (buildingbite/walklib_aisystem:v1.2-secure)
```java
// OpenAIConfig.java - 보안 버전
@PostConstruct
public void init() {
    System.out.println("OpenAIConfig PostConstruct initialization!");
    
    // ✅ 환경 변수 우선
    this.apiKey = System.getenv("OPENAI_API_KEY");
    
    // Spring property로 fallback
    if (this.apiKey == null || this.apiKey.isEmpty()) {
        this.apiKey = configApiKey;
    }
    
    if (this.apiKey != null && !this.apiKey.isEmpty()) {
        System.out.println("OpenAI API Key configured: " + 
            this.apiKey.substring(0, Math.min(10, this.apiKey.length())) + "...");
    } else {
        // ✅ 하드코딩 없음, 경고만 표시
        System.out.println("WARNING: OpenAI API Key not configured. AI features will use fallback mode.");
    }
}

@Bean
public RestTemplate openAIRestTemplate() {
    RestTemplate restTemplate = new RestTemplate();
    restTemplate.getInterceptors().add((request, body, execution) -> {
        if (apiKey != null && !apiKey.isEmpty()) {
            // ✅ 설정된 API 키 사용
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
        } else {
            System.out.println("WARNING: No API key available for OpenAI request");
        }
        return execution.execute(request, body);
    });
    return restTemplate;
}
```

## 🔐 보안 관점 분석

### 기본 배포의 보안 문제
1. **코드 노출**: API 키가 소스 코드에 하드코딩
2. **이미지 노출**: Docker 이미지 내부에 API 키 포함
3. **버전 관리**: Git 히스토리에 API 키 기록
4. **배포 위험**: 이미지만으로 API 키 확인 가능

### 보안 배포의 장점
1. **Secret 관리**: Kubernetes Secret으로 암호화 저장
2. **환경 분리**: 개발/스테이징/프로덕션 환경별 다른 키 사용 가능
3. **접근 제어**: RBAC으로 Secret 접근 권한 제한
4. **키 교체**: 재배포 없이 Secret 업데이트로 키 교체

## 🚀 배포 명령어 비교

### 기본 배포
```bash
# 한 줄로 완료
kubectl apply -f k8s-deployments/all-in-one.yaml

# 결과: 즉시 사용 가능하지만 보안 위험
```

### 보안 배포
```bash
# 방법 1: 기본 키 사용
kubectl apply -f k8s-deployments/secure-deployment.yaml

# 방법 2: 커스텀 키 사용
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="your-custom-key"
kubectl apply -f k8s-deployments/secure-deployment.yaml

# 결과: 추가 단계 필요하지만 안전함
```

## 📈 사용 시나리오별 권장사항

### 개발/테스트 환경
- **기본 배포** 사용 가능
- 빠른 프로토타이핑
- 내부 네트워크만 접근

### 스테이징/프로덕션 환경
- **보안 배포** 필수
- 규정 준수 필요
- 외부 접근 가능

### 데모/교육 목적
- **기본 배포** 권장
- 설정 복잡도 최소화
- 빠른 결과 확인

## 🔄 마이그레이션 가이드

### 기본 → 보안으로 전환
```bash
# 1. 기존 AI 서비스 제거
kubectl delete deployment walklib-aisystem

# 2. Secret 생성
kubectl create secret generic openai-secret \
  --from-literal=OPENAI_API_KEY="your-api-key"

# 3. 보안 버전 배포
kubectl apply -f k8s-deployments/secure-deployment.yaml
```

### 보안 → 기본으로 전환 (권장하지 않음)
```bash
# 1. Secret 제거
kubectl delete secret openai-secret

# 2. 기본 버전 재배포
kubectl apply -f k8s-deployments/all-in-one.yaml
```

## 💡 베스트 프랙티스

1. **개발 중**: 기본 배포로 빠른 테스트
2. **커밋 전**: 보안 배포로 전환
3. **프로덕션**: 항상 보안 배포 사용
4. **API 키 교체**: 정기적으로 Secret 업데이트