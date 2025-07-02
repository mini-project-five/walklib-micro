#!/bin/bash

echo "=== WalkLib 서비스 접속 정보 ==="
echo ""

# Frontend IP
FRONTEND_IP=$(kubectl get svc walklib-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "📚 WalkLib 메인 페이지:"
echo "   http://$FRONTEND_IP"
echo ""

# Gateway IP
GATEWAY_IP=$(kubectl get svc walklib-gateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "🔧 API Gateway (개발용):"
echo "   http://$GATEWAY_IP:8080"
echo ""

echo "=== 현재 등록된 작가 수 확인 ==="
AUTHOR_COUNT=$(curl -s "http://$GATEWAY_IP:8080/authors" | grep -o '"totalElements" : [0-9]*' | grep -o '[0-9]*')
echo "현재 등록된 작가: ${AUTHOR_COUNT}명"
echo ""

echo "=== 접속 방법 ==="
echo "1. 위의 메인 페이지 URL로 접속"
echo "2. 작가 로그인 → 회원가입"
echo "3. 가입 후 로그인"
echo ""
echo "⚠️  주의: IP 주소가 변경될 수 있으므로 이 스크립트로 확인하세요"