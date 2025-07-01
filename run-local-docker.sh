
#!/bin/bash

# 공통 설정
NETWORK="infra_default"
PROFILE="docker"

# 서비스별 정보 정의 (디렉토리명, 이미지명, 컨테이너명, 외부 포트)
SERVICES=(
  "gateway walklib_gateway gateway 8080"
  "user_management walklib_user walklib_user_management 8082"
  "subscription_management walklib_subscription walklib_subscription_management 8084"
  "point_management walklib_point walklib_point_management 8083"
  "content_writing_management walklib_writing walklib_content_writing_management 8087"
  "book_management walklib_book walklib_book_management 8085"
  "author_management walklib_author walklib_author_management 8086"
  "ai_system_management walklib_aisystem walklib_ai_system_management 8088"
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
  docker build -t "$IMAGE:local" . || { echo "❌ Docker 빌드 실패: $DIR"; exit 1; }

  # 기존 컨테이너 삭제
  docker rm -f "$CONTAINER" 2>/dev/null

  # 도커 실행
  docker run -d --name "$CONTAINER" \
    -p "$PORT:8080" \
    --network "$NETWORK" \
    -e SPRING_PROFILES_ACTIVE="$PROFILE" \
    "$IMAGE:local"

  # 원래 경로로 복귀
  cd - >/dev/null
done

echo "🚀 [frontend] 빌드 및 컨테이너 실행 중..."
cd "frontend" || { echo "❌ 디렉토리 없음: frontend"; exit 1; }
# 도커 이미지 빌드
docker build -t "walklib_frontend:local" . || { echo "❌ Docker 빌드 실패: frontend"; exit 1; }
# 기존 컨테이너 삭제
docker rm -f "walklib_frontend" 2>/dev/null
docker run -d \
    --name "walklib_frontend" \
    --network="infra_default" \
    --network-alias="frontend" \
    -p "80:80" \
    "walklib_frontend:local"
cd ..
echo ""
echo "✅ 모든 마이크로서비스가 실행되었습니다."
