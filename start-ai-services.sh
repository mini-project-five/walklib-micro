#!/bin/bash

# AI 서비스 실행 스크립트

echo "🚀 Walking Library AI Services 시작"
echo "======================================"

# API 키 확인
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY 환경 변수가 설정되지 않았습니다."
    echo "다음 명령어로 설정하세요:"
    echo "export OPENAI_API_KEY='your-openai-api-key-here'"
    echo ""
    echo "또는 .env 파일에서 자동 로드:"
    if [ -f ".env" ]; then
        echo "✅ .env 파일을 찾았습니다. 환경 변수를 로드합니다..."
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo "❌ .env 파일이 없습니다. .env.example을 참고하여 생성하세요."
        exit 1
    fi
fi

echo "🔑 API Key: ${OPENAI_API_KEY:0:20}..."

# 사용자 선택
echo ""
echo "실행할 서비스를 선택하세요:"
echo "1) AI 백엔드 서비스만 실행"
echo "2) 프론트엔드만 실행"
echo "3) 모든 서비스 실행"
echo "4) AI 기능 테스트"

read -p "선택 (1-4): " choice

case $choice in
    1)
        echo "🔄 AI 백엔드 서비스 시작..."
        cd ai-system-management
        mvn spring-boot:run
        ;;
    2)
        echo "🔄 프론트엔드 시작..."
        cd frontend
        npm run dev
        ;;
    3)
        echo "🔄 모든 서비스 시작..."
        # 백그라운드에서 AI 서비스 실행
        cd ai-system-management
        mvn spring-boot:run &
        AI_PID=$!
        
        # 프론트엔드 실행
        cd ../frontend
        npm run dev &
        FRONTEND_PID=$!
        
        echo "✅ 서비스들이 시작되었습니다:"
        echo "   - AI 서비스: http://localhost:8088"
        echo "   - 프론트엔드: http://localhost:3000"
        echo ""
        echo "종료하려면 Ctrl+C를 누르세요..."
        
        # 프로세스 종료 시그널 처리
        trap "kill $AI_PID $FRONTEND_PID; exit" SIGINT SIGTERM
        wait
        ;;
    4)
        echo "🧪 AI 기능 테스트..."
        echo "프론트엔드의 AI 테스트 페이지에서 확인하세요:"
        echo "http://localhost:3000/ai-test"
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac
