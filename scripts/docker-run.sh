#!/bin/bash

# 공통 설정
NETWORK="infra_default"
PROFILE="docker"

# 사용자명 인자 체크
if [ -z "$1" ]; then
  echo "❌ Docker Hub 사용자명을 인자로 입력해주세요."
  echo "예시: bash ./scripts/docker-run.sh chldlsrb1000"
  exit 1
fi

DOCKER_HUB_ID="$1"

# 공통 서비스 목록 불러오기
source "$(dirname "$0")/config/services.sh"

# 네트워크 생성
docker network create "$NETWORK" 2>/dev/null || echo "네트워크 '$NETWORK'이 이미 존재합니다."

for SERVICE in "${SERVICES[@]}"; do
  read -r DIR IMAGE CONTAINER PORT <<< "$SERVICE"

  if [ "$DIR" == "frontend" ]; then
    echo "⏭️  [frontend] 서비스는 이 스크립트에서 제외됩니다."
    continue
  fi

  echo ""
  echo "🚀 [${DIR}] 빌드 및 컨테이너 실행 중..."

  # 디렉토리 이동
  cd "$DIR" || { echo "❌ 디렉토리 없음: $DIR"; exit 1; }

  # Maven 빌드
  mvn clean package -DskipTests || { echo "❌ Maven 빌드 실패: $DIR"; exit 1; }

  TAG="${DOCKER_HUB_ID}/${IMAGE}:latest"

  # 도커 이미지 빌드
  docker build -t "$TAG" . || { echo "❌ Docker 빌드 실패: $DIR"; exit 1; }

  # Docker Hub에 푸시
  docker push "$TAG" || { echo "❌ Docker 푸시 실패: $TAG"; exit 1; }

  # 기존 컨테이너 삭제
  docker rm -f "$CONTAINER" 2>/dev/null

  # 도커 실행
  docker run -d --name "$CONTAINER" \
    -p "$PORT:8080" \
    --network "$NETWORK" \
    "$TAG"

  # 원래 경로로 복귀
  cd - >/dev/null
done

# 프론트엔드 빌드 및 실행
echo ""
echo "🚀 [frontend] 빌드 및 컨테이너 실행 중..."

# 디렉토리 이동
cd "frontend" || { echo "❌ 디렉토리 없음: frontend"; exit 1; }

TAG="${DOCKER_HUB_ID}/frontend:latest"

# 도커 이미지 빌드
docker build -t "$TAG" . || { echo "❌ Docker 빌드 실패: frontend"; exit 1; }

# Docker Hub에 푸시
docker push "$TAG" || { echo "❌ Docker 푸시 실패: $TAG"; exit 1; }

# 기존 컨테이너 삭제
docker rm -f "frontend" 2>/dev/null

# 도커 실행
docker run -d --name "frontend" \
    -p "80:80" \
    --network "$NETWORK" \
    -e SPRING_PROFILES_ACTIVE="$PROFILE" \
    "$TAG"

# 원래 경로로 복귀
cd - >/dev/null

# 불필요한 이미지 및 컨테이너 정리
docker image prune -f

echo ""
echo "✅ 모든 마이크로서비스가 실행되었습니다."
