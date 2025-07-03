#!/bin/bash

# ==============================================================================
# 모든 마이크로서비스의 Kubernetes 설정을 배포하는 스크립트
#
# 사용법:
# ./deploy_all.sh <DOCKER_HUB_ID>
#
# 예시:
# ./deploy_all.sh mydockerid
# ==============================================================================

# --- 1. 유저 아이디 인자 확인 ---
HUB_ID=$1
if [ -z "$HUB_ID" ]; then
  echo "❌ 에러: 첫 번째 인자로 Docker Hub 유저 아이디를 입력해야 합니다."
  echo "   사용법: $0 <your-hub-id>"
  exit 1
fi

# --- 2. 서비스 설정 파일 불러오기 ---
SERVICES_FILE="$(dirname "$0")/config/services.sh"
if [ ! -f "$SERVICES_FILE" ]; then
  echo "❌ 에러: '$SERVICES_FILE' 파일을 찾을 수 없습니다."
  exit 1
fi
source "$SERVICES_FILE"
echo "✅ 서비스 설정 파일 ('$SERVICES_FILE')을 성공적으로 불러왔습니다."

echo "--------------------------------------------------"

# --- 3. Kafka 및 Kafka-UI 선행 배포 ---
echo "▶️ Kafka와 Kafka-UI를 먼저 배포합니다..."

KAFKA_PATH="./kubernetes/kafka"
KAFKA_UI_PATH="./kubernetes/kafka-ui"

# Kafka 배포 (해당 디렉토리의 모든 yml, yaml 파일을 적용)
if [ -d "$KAFKA_PATH" ]; then
  echo "  - Kafka 관련 YAML 파일들을 적용합니다: $KAFKA_PATH"
  kubectl apply -f "$KAFKA_PATH"
else
  echo "  ⚠️  경고: Kafka 경로를 찾을 수 없습니다: $KAFKA_PATH"
fi

# Kafka-UI 배포 (해당 디렉토리의 모든 yml, yaml 파일을 적용)
if [ -d "$KAFKA_UI_PATH" ]; then
  echo "  - Kafka-UI 관련 YAML 파일들을 적용합니다: $KAFKA_UI_PATH"
  kubectl apply -f "$KAFKA_UI_PATH"
else
  echo "  ⚠️  경고: Kafka-UI 경로를 찾을 수 없습니다: $KAFKA_UI_PATH"
fi

echo "✅ Kafka 및 Kafka-UI 배포 요청이 완료되었습니다."
echo "--------------------------------------------------"

# --- 4. 각 마이크로서비스를 순회하며 배포 ---
for service_info in "${SERVICES[@]}"; do
  # 서비스 정보 파싱
  read -r -a service_parts <<< "$service_info"
  DIR_NAME=${service_parts[0]}
  IMAGE_NAME=${service_parts[1]}

  echo "🚀 '${DIR_NAME}' 서비스 배포를 시작합니다..."

  # Kubernetes YAML 파일 경로 정의
  DEPLOYMENT_FILE="./${DIR_NAME}/kubernetes/deployment.yml"
  SERVICE_FILE="./${DIR_NAME}/kubernetes/service.yml"
  NEW_IMAGE="${HUB_ID}/${IMAGE_NAME}:latest"

  # --- Deployment 파일 처리 ---
  if [ -f "$DEPLOYMENT_FILE" ]; then
    echo "   - Deployment 파일을 수정하여 적용합니다: $DEPLOYMENT_FILE"

    # sed: "image:" 라인을 찾아 값을 교체하고 kubectl에 전달
    sed -E "s|(image: ).*|\1${NEW_IMAGE}|" "$DEPLOYMENT_FILE" | kubectl apply -f -    
  else
    echo "   ⚠️  경고: Deployment 파일을 찾을 수 없습니다: $DEPLOYMENT_FILE"
  fi

  # --- Service 파일 처리 ---
  if [ -f "$SERVICE_FILE" ]; then
    echo "   - Service 파일을 적용합니다: $SERVICE_FILE"
    kubectl apply -f "$SERVICE_FILE"
  else
    echo "   ⚠️  경고: Service 파일을 찾을 수 없습니다: $SERVICE_FILE"
  fi

  echo "✅ '${DIR_NAME}' 서비스 배포 요청이 완료되었습니다."
  echo "--------------------------------------------------"
done

echo "🎉 모든 서비스의 배포 요청이 완료되었습니다."