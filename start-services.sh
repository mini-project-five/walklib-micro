#!/bin/bash

echo "🚀 Starting all microservices..."

# User Management (포트 8081)
echo "Starting User Management..."
cd user_management
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8081" &
USER_PID=$!
cd ..

# Book Management (포트 8082)
echo "Starting Book Management..."
cd book_management
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8082" &
BOOK_PID=$!
cd ..

# Point Management (포트 8083)
echo "Starting Point Management..."
cd point_management
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8083" &
POINT_PID=$!
cd ..

# Subscription Management (포트 8084)
echo "Starting Subscription Management..."
cd subscription_management
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8084" &
SUB_PID=$!
cd ..

# Content Writing Management (포트 8087)
echo "Starting Content Writing Management..."
cd content_writing_management
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8087" &
CONTENT_PID=$!
cd ..

# Author Management (포트 8086)
echo "Starting Author Management..."
cd author_management
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8086" &
AUTHOR_PID=$!
cd ..

# AI System Management (포트 8089, .env 로드)
echo "Starting AI System Management..."
cd ai_system_management
if [ -f .env ]; then
    export $(cat .env | xargs)
fi
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8089" &
AI_PID=$!
cd ..

# Gateway (포트 8088)
echo "Starting Gateway..."
cd gateway
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8088" &
GATEWAY_PID=$!
cd ..

echo "🎯 All services started!"
echo "📝 PIDs: User=$USER_PID, Book=$BOOK_PID, Point=$POINT_PID, Sub=$SUB_PID, Content=$CONTENT_PID, Author=$AUTHOR_PID, AI=$AI_PID, Gateway=$GATEWAY_PID"
echo "🌐 Gateway running on http://localhost:8088"
echo "🎨 Frontend: cd frontend && npm run dev"
echo "🛑 To stop all: ./stop-services.sh"

# 서비스 상태 저장
echo "$USER_PID,$BOOK_PID,$POINT_PID,$SUB_PID,$CONTENT_PID,$AUTHOR_PID,$AI_PID,$GATEWAY_PID" > .service_pids
