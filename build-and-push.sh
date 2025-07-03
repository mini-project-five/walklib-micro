#!/bin/bash

# 공통 설정
NETWORK="infra_default"
PROFILE="docker"
DOCKER_USERNAME="lmo2914"

# 서비스별 정보 정의 (디렉토리명, 이미지명, 컨테이너명, 외부 포트)
SERVICES=(
  "user_management ${DOCKER_USERNAME}/user-m userManagement 8082"
  "subscription_management ${DOCKER_USERNAME}/subs-m subscriptionManagement 8084"
  "point_management ${DOCKER_USERNAME}/point-m pointManagement 8083"
  "content_writing_management ${DOCKER_USERNAME}/content-m contentWritingManagement 8087"
  "book_management ${DOCKER_USERNAME}/book-m bookManagement 8085"
  "author_management ${DOCKER_USERNAME}/author-m authorManagement 8086"
  "ai_system_management ${DOCKER_USERNAME}/ai-m aiSystemManagement 8088"
)

echo "🔐 Docker Hub 로그인을 확인합니다..."
if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
  echo "Docker Hub에 로그인해주세요:"
  docker login
fi

for SERVICE in "${SERVICES[@]}"; do
  read -r DIR IMAGE CONTAINER PORT <<< "$SERVICE"

  echo ""
  echo "🚀 [${DIR}] 빌드, 푸시 및 컨테이너 실행 중..."

  # 디렉토리 이동
  cd "$DIR" || { echo "❌ 디렉토리 없음: $DIR"; exit 1; }

  # Maven 빌드
  echo "📦 Maven 빌드 중..."
  mvn clean package -DskipTests || { echo "❌ Maven 빌드 실패: $DIR"; exit 1; }

  # 도커 이미지 빌드
  echo "🐳 Docker 이미지 빌드 중..."
  docker build -t "$IMAGE:latest" . || { echo "❌ Docker 빌드 실패: $DIR"; exit 1; }

  # Docker Hub에 푸시
  echo "⬆️ Docker Hub에 푸시 중..."
  docker push "$IMAGE:latest" || { echo "❌ Docker 푸시 실패: $DIR"; exit 1; }
  echo "✅ ${IMAGE}:latest 푸시 완료"

  # 기존 컨테이너 삭제
  docker rm -f "$CONTAINER" 2>/dev/null

  # 도커 실행
  echo "▶️ 컨테이너 실행 중..."
  docker run -d --name "$CONTAINER" \
    -p "$PORT:8080" \
    --network "$NETWORK" \
    -e SPRING_PROFILES_ACTIVE="$PROFILE" \
    "$IMAGE:latest"

  echo "✅ ${CONTAINER} 컨테이너 실행 완료 (포트: ${PORT})"

  # 원래 경로로 복귀
  cd - >/dev/null
done

echo ""
echo "🎉 모든 마이크로서비스가 빌드, 푸시, 실행되었습니다!"
echo ""
echo "📋 푸시된 이미지들:"
for SERVICE in "${SERVICES[@]}"; do
  read -r DIR IMAGE CONTAINER PORT <<< "$SERVICE"
  echo "   - ${IMAGE}:latest"
done
