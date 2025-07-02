#!/bin/bash

# 디렉토리 이동
cd "frontend" || { echo "❌ 디렉토리 없음: frontend"; exit 1; }

# 도커 이미지 빌드
docker build -t "frontend:local" . || { echo "❌ Docker 빌드 실패: frontend"; exit 1; }

# 원래 경로로 복귀
cd - >/dev/null

LOCAL_TAG="frontend:local"
HUB_TAG="chldlsrb1000/frontend:latest"

echo "🔄 태그 변경: $LOCAL_TAG → $HUB_TAG"
docker tag "$LOCAL_TAG" "$HUB_TAG"

echo "📤 Docker Hub에 푸시: $HUB_TAG"
docker push "$HUB_TAG"
