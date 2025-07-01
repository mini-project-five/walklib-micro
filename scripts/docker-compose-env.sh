#!/bin/bash

# WalkLib Micro - Docker Compose .env 기반 로컬 개발 스크립트
# 사용법: ./scripts/docker-compose-env.sh [start|stop|logs]

set -e

COMMAND=${1:-start}

case $COMMAND in
    start)
        echo "🚀 WalkLib Micro 로컬 개발 환경 시작..."
        
        # .env 파일 확인
        if [ ! -f ".env" ]; then
            echo "❌ .env 파일이 없습니다!"
            echo "📋 .env.example을 복사해서 .env 파일을 만들고 API 키를 설정하세요:"
            echo "   cp .env.example .env"
            echo "   # .env 파일을 편집하여 OPENAI_API_KEY 설정"
            exit 1
        fi

        # API 키 확인 (로드하지는 않음, docker-compose가 처리)
        if ! grep -q "OPENAI_API_KEY=" .env; then
            echo "❌ OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다!"
            exit 1
        fi

        echo "✅ .env 파일 확인됨"
        echo "🐳 Docker Compose로 서비스 시작 중..."
        
        docker-compose -f docker-compose.env.yml up -d
        
        echo "⏳ 서비스 시작 대기 중..."
        sleep 10
        
        echo "✅ 로컬 개발 환경 시작 완료!"
        echo ""
        echo "🌐 서비스 URL:"
        echo "Frontend: http://localhost"
        echo "Gateway: http://localhost:8080"
        echo "AI System: http://localhost:8081"
        echo ""
        echo "📊 상태 확인:"
        echo "docker-compose -f docker-compose.env.yml ps"
        echo "docker-compose -f docker-compose.env.yml logs walklib-aisystem | grep 'OpenAI'"
        ;;
        
    stop)
        echo "🛑 WalkLib Micro 로컬 개발 환경 중지..."
        docker-compose -f docker-compose.env.yml down
        echo "✅ 중지 완료"
        ;;
        
    logs)
        echo "📋 서비스 로그:"
        docker-compose -f docker-compose.env.yml logs -f
        ;;
        
    *)
        echo "사용법: $0 [start|stop|logs]"
        echo "  start - 개발 환경 시작"
        echo "  stop  - 개발 환경 중지"
        echo "  logs  - 서비스 로그 확인"
        exit 1
        ;;
esac