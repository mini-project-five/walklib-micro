#!/bin/bash

# WalkLib Micro - .env 기반 배포 스크립트
# 사용법: ./scripts/deploy-with-env.sh

set -e

echo "🚀 WalkLib Micro .env 기반 배포 시작..."

# .env 파일 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다!"
    echo "📋 .env.example을 복사해서 .env 파일을 만들고 API 키를 설정하세요:"
    echo "   cp .env.example .env"
    echo "   # .env 파일을 편집하여 OPENAI_API_KEY 설정"
    exit 1
fi

# .env 파일 로드
echo "📁 .env 파일 로드 중..."
export $(cat .env | grep -v '^#' | xargs)

# API 키 확인
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다!"
    exit 1
fi

echo "✅ OpenAI API 키 확인됨: ${OPENAI_API_KEY:0:10}..."

# Kubernetes ConfigMap 생성
echo "🔧 ConfigMap 생성 중..."
kubectl create configmap walklib-env \
    --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -

echo "✅ ConfigMap 생성 완료"

# 서비스 배포
echo "🚢 서비스 배포 중..."
kubectl apply -f k8s-deployments/env-deployment.yaml

echo "⏳ 배포 완료 대기 중..."
kubectl wait --for=condition=available --timeout=300s deployment/walklib-gateway
kubectl wait --for=condition=available --timeout=300s deployment/walklib-frontend

echo "✅ 배포 완료!"
echo ""
echo "🌐 서비스 URL:"
echo "Frontend: http://$(kubectl get svc walklib-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo 'localhost')"
echo "Gateway: http://$(kubectl get svc walklib-gateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo 'localhost'):8080"
echo ""
echo "📊 상태 확인:"
echo "kubectl get pods"
echo "kubectl logs deployment/walklib-aisystem | grep 'OpenAI'"