#!/bin/bash

# Simple script to run all services
echo "🚀 Starting all services..."

export JAVA_HOME=/workspace/.vscode-remote/data/User/globalStorage/pleiades.java-extension-pack-jdk/java/21

services=("gateway" "user_management" "author_management" "book_management" "content_writing_management" "point_management" "subscription_management" "ai_system_management")

for service in "${services[@]}"; do
    echo "Starting $service..."
    cd "$service" && mvn spring-boot:run &
    cd ..
    sleep 2
done

echo "✅ All services started!"
echo "Press Ctrl+C to stop all services"
wait