#!/bin/bash

# 공통 설정
NETWORK="infra_default"

# 사용자명 인자 체크
if [ -z "$1" ]; then
  echo "❌ Docker Hub 사용자명을 인자로 입력해주세요."
  echo "예시: bash ./scripts/docker-re-fe.sh chldlsrb1000"
  exit 1
fi

DOCKER_HUB_ID="$1"
TAG="${DOCKER_HUB_ID}/frontend:latest"

# 디렉토리 이동
cd "frontend" || { echo "❌ 디렉토리 없음: frontend"; exit 1; }

# 도커 이미지 빌드
docker build -t "$TAG" . || { echo "❌ Docker 빌드 실패: $DIR"; exit 1; }

# Docker Hub에 푸시
docker push "$TAG" || { echo "❌ Docker 푸시 실패: $TAG"; exit 1; }

# 도커 실행
docker run -d --name "frontend" \
    -p "80:80" \
    --network "$NETWORK" \
    "$TAG"

# 원래 경로로 복귀
cd - >/dev/null

echo "✅ 프론트엔드 Docker 이미지 빌드 및 푸시 완료: $TAG"
