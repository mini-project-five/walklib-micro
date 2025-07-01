# Frontend Dockerfile for WalkLib Micro (React + Vite + TypeScript)
FROM node:18-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (캐시 최적화)
COPY package.json package-lock.json ./

# npm 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# Production stage - Nginx로 정적 파일 서빙
FROM nginx:alpine

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 정적 파일을 Nginx로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]