#!/bin/bash

# 사용자명 인자 체크
if [ -z "$1" ]; then
  echo "❌ Docker Hub 사용자명을 인자로 입력해주세요."
  echo "예시: ./upload.sh chldlsrb"
  exit 1
fi

DOCKER_HUB_ID="$1"

# 현재 디렉토리 기준 services.sh 로드
source ./services.sh

# 반복하면서 태그 지정 및 푸시
for SERVICE in "${SERVICES[@]}"; do
  IFS=' ' read -r DIR IMAGE_NAME CONTAINER_NAME PORT <<< "$SERVICE"

  LOCAL_TAG="${IMAGE_NAME}:local"
  HUB_TAG="${DOCKER_HUB_ID}/${IMAGE_NAME}:latest"

  echo "🔄 태그 변경: $LOCAL_TAG → $HUB_TAG"
  docker tag "$LOCAL_TAG" "$HUB_TAG"

  echo "📤 Docker Hub에 푸시: $HUB_TAG"
  docker push "$HUB_TAG"
done
