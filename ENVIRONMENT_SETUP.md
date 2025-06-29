# 환경 변수 설정 가이드

## 필수 환경 변수

이 프로젝트를 실행하기 위해서는 다음 환경 변수들을 설정해야 합니다:

### 1. OpenAI API 키
```bash
export OPENAI_API_KEY=your-actual-openai-api-key-here
```

### 2. JWT Secret (프로덕션 환경에서 필수)
```bash
export JWT_SECRET=your-secure-jwt-secret-key-here
```

## 로컬 개발 환경 설정

### 방법 1: 환경 변수 직접 설정
```bash
# macOS/Linux
export OPENAI_API_KEY=your-openai-api-key
export JWT_SECRET=your-jwt-secret-key

# Windows
set OPENAI_API_KEY=your-openai-api-key
set JWT_SECRET=your-jwt-secret-key
```

### 방법 2: .env 파일 사용 (권장)
프로젝트 루트에 `.env` 파일을 생성하고 다음과 같이 설정:

```env
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-secure-jwt-secret-key-here
```

**⚠️ 주의: .env 파일은 절대 Git에 커밋하지 마세요!**

## OpenAI API 키 발급 방법

1. https://platform.openai.com/ 방문
2. 계정 생성 및 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 안전한 곳에 저장

## 프로덕션 환경

프로덕션 환경에서는 클라우드 서비스의 환경 변수 관리 기능을 사용하세요:

- **AWS**: Systems Manager Parameter Store / Secrets Manager
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault
- **Docker**: docker run -e OPENAI_API_KEY=xxx
- **Kubernetes**: Secrets

## 보안 주의사항

1. **API 키를 코드에 하드코딩하지 마세요**
2. **Git에 API 키를 커밋하지 마세요**
3. **API 키가 노출된 경우 즉시 재발급하세요**
4. **정기적으로 API 키를 순환(rotate)하세요**
