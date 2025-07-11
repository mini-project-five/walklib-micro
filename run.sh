#!/bin/bash

# 공통 설정
NETWORK="infra_default"
PROFILE="docker"

# 서비스별 정보 정의 (디렉토리명, 이미지명, 컨테이너명, 외부 포트)
SERVICES=(
  "user_management lmo2914/user-m userManagement 8082"
  "subscription_management lmo2914/subs-m subscriptionManagement 8084"
  "point_management lmo2914/point-m pointManagement 8083"
  "content_writing_management lmo2914/content-m contentWritingManagement 8087"
  "book_management lmo2914/book-m bookManagement 8085"
  "author_management lmo2914/author-m authorManagement 8086"
  "ai_system_management lmo2914/ai-m aiSystemManagement 8088"
)

for SERVICE in "${SERVICES[@]}"; do
  read -r DIR IMAGE CONTAINER PORT <<< "$SERVICE"

  echo ""
  echo "🚀 [${DIR}] 빌드 및 컨테이너 실행 중..."

  # 디렉토리 이동
  cd "$DIR" || { echo "❌ 디렉토리 없음: $DIR"; exit 1; }

  # Maven 빌드
  mvn clean package -DskipTests || { echo "❌ Maven 빌드 실패: $DIR"; exit 1; }

  # 도커 이미지 빌드
  docker build -t "$IMAGE:latest" . || { echo "❌ Docker 빌드 실패: $DIR"; exit 1; }

  # 기존 컨테이너 삭제
  docker rm -f "$CONTAINER" 2>/dev/null

  # 도커 실행
  docker run -d --name "$CONTAINER" \
    -p "$PORT:8080" \
    --network "$NETWORK" \
    -e SPRING_PROFILES_ACTIVE="$PROFILE" \
    "$IMAGE:latest"

  # 원래 경로로 복귀
  cd - >/dev/null
done

echo ""
echo "✅ 모든 마이크로서비스가 실행되었습니다."
