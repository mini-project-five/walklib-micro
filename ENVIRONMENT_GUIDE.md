# 환경변수 설정 가이드

## 📁 환경변수 파일 구조

```
walklib-micro/
├── .env                    # 루트 환경변수 (모든 API 키와 공통 설정)
├── .env.example           # 환경변수 예시 파일
└── frontend/
    └── .env               # 프론트엔드 전용 설정 (API URL 등)
```

## 환경변수 사용 방식

### 1. 루트 `.env` 파일 (메인 설정)
- **OpenAI API 키**: `OPENAI_API_KEY`, `VITE_CHAT_API_KEY`
- **JWT Secret**: `JWT_SECRET`
- **모든 민감한 정보 포함**

### 2. 프론트엔드 `.env` 파일
- **API 엔드포인트**: `VITE_API_BASE_URL` 등
- **민감하지 않은 설정만 포함**
- **OpenAI API 키는 루트에서 자동 로드**

## 실행 방법

### 백엔드 (AI 서비스)
```bash
# 루트 디렉토리에서
./start-ai-services.sh
```

### 프론트엔드
```bash
# frontend 디렉토리에서
cd frontend && npm run dev
```

## 설정 방법

1. **루트 `.env` 파일에 실제 API 키 설정**
   ```env
   OPENAI_API_KEY=your-actual-openai-key
   VITE_CHAT_API_KEY=your-actual-openai-key
   ```

2. **Vite 설정으로 루트 환경변수 자동 로드**
   - `frontend/vite.config.ts`에서 상위 디렉토리 `.env` 파일 로드
   - `VITE_CHAT_API_KEY` 자동 주입

3. **백엔드는 스크립트로 환경변수 로드**
   - `start-ai-services.sh`에서 루트 `.env` 자동 로드
   - Spring Boot에서 `${OPENAI_API_KEY}` 환경변수 사용

## 보안 특징

- 모든 `.env` 파일이 `.gitignore`에 포함
- 민감한 정보는 루트 `.env`에만 저장
- GitHub Push Protection 통과
- 프론트엔드/백엔드 모두 동일한 API 키 사용

## 테스트

프론트엔드에서 AI 기능 테스트:
1. http://localhost:3003 접속 (프론트엔드)
2. 작가 로그인 후 AI 서비스 테스트
3. 텍스트 다듬기, 표지 생성 등 AI 기능 확인
4. 백엔드 경유/직접 호출 모드 모두 테스트 가능
